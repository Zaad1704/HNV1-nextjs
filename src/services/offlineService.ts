interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  data?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
}

interface OfflineData {
  properties: any[];
  tenants: any[];
  payments: any[];
  lastSync: number;
}

class OfflineService {
  private dbName = 'HNVOfflineDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private requestQueue: QueuedRequest[] = [];
  private isOnline = navigator.onLine;
  private syncInProgress = false;

  constructor() {
    this.initializeDB();
    this.setupEventListeners();
    this.loadQueueFromStorage();
  }

  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('properties')) {
          db.createObjectStore('properties', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('tenants')) {
          db.createObjectStore('tenants', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('payments')) {
          db.createObjectStore('payments', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('queue')) {
          db.createObjectStore('queue', { keyPath: 'id' });
        }
      };
    });
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Sync when page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.processQueue();
      }
    });
  }

  private loadQueueFromStorage(): void {
    const stored = localStorage.getItem('hnv_offline_queue');
    if (stored) {
      try {
        this.requestQueue = JSON.parse(stored);
      } catch (error) {
        console.error('Failed to load offline queue:', error);
        this.requestQueue = [];
      }
    }
  }

  private saveQueueToStorage(): void {
    localStorage.setItem('hnv_offline_queue', JSON.stringify(this.requestQueue));
  }

  // Store data for offline access
  async storeData(storeName: string, data: any[]): Promise<void> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      // Clear existing data
      store.clear();

      // Add new data
      data.forEach(item => {
        store.add(item);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Retrieve data for offline access
  async getData(storeName: string): Promise<any[]> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Queue requests for when online
  queueRequest(url: string, method: string, data?: any, headers?: Record<string, string>): string {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queuedRequest: QueuedRequest = {
      id,
      url,
      method,
      data,
      headers,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.requestQueue.push(queuedRequest);
    this.saveQueueToStorage();

    // Try to process immediately if online
    if (this.isOnline) {
      this.processQueue();
    }

    return id;
  }

  // Process queued requests
  private async processQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline || this.requestQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;

    const maxRetries = 3;
    const processedIds: string[] = [];

    for (const request of this.requestQueue) {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: {
            'Content-Type': 'application/json',
            ...request.headers
          },
          body: request.data ? JSON.stringify(request.data) : undefined
        });

        if (response.ok) {
          processedIds.push(request.id);

        } else {
          request.retryCount++;
          if (request.retryCount >= maxRetries) {
            processedIds.push(request.id);
            console.error(`Failed to sync request after ${maxRetries} attempts: ${request.id}`);
          }
        }
      } catch (error) {
        request.retryCount++;
        if (request.retryCount >= maxRetries) {
          processedIds.push(request.id);
          console.error(`Failed to sync request: ${request.id}`, error);
        }
      }
    }

    // Remove processed requests
    this.requestQueue = this.requestQueue.filter(req => !processedIds.includes(req.id));
    this.saveQueueToStorage();

    this.syncInProgress = false;

    // Emit sync complete event
    window.dispatchEvent(new CustomEvent('offlineSyncComplete', {
      detail: { processedCount: processedIds.length }
    }));
  }

  // Sync all data
  async syncAllData(): Promise<void> {
    if (!this.isOnline) return;

    try {
      // Fetch latest data from server
      const [properties, tenants, payments] = await Promise.all([
        fetch('/api/properties').then(res => res.json()),
        fetch('/api/tenants').then(res => res.json()),
        fetch('/api/payments').then(res => res.json())
      ]);

      // Store in IndexedDB
      await Promise.all([
        this.storeData('properties', properties.data || []),
        this.storeData('tenants', tenants.data || []),
        this.storeData('payments', payments.data || [])
      ]);

      // Update last sync timestamp
      await this.setMetadata('lastSync', Date.now());

    } catch (error) {
      console.error('Failed to sync data:', error);
    }
  }

  // Metadata management
  async setMetadata(key: string, value: any): Promise<void> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      
      store.put({ key, value });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getMetadata(key: string): Promise<any> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  // Check if data is stale
  async isDataStale(maxAgeMinutes: number = 30): Promise<boolean> {
    const lastSync = await this.getMetadata('lastSync');
    if (!lastSync) return true;

    const ageMinutes = (Date.now() - lastSync) / (1000 * 60);
    return ageMinutes > maxAgeMinutes;
  }

  // Get offline status
  getStatus() {
    return {
      isOnline: this.isOnline,
      queuedRequests: this.requestQueue.length,
      syncInProgress: this.syncInProgress
    };
  }

  // Clear all offline data
  async clearAllData(): Promise<void> {
    if (!this.db) await this.initializeDB();

    const storeNames = ['properties', 'tenants', 'payments', 'metadata', 'queue'];
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeNames, 'readwrite');
      
      storeNames.forEach(storeName => {
        transaction.objectStore(storeName).clear();
      });

      transaction.oncomplete = () => {
        this.requestQueue = [];
        this.saveQueueToStorage();
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Get storage usage
  async getStorageUsage(): Promise<{ used: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0
      };
    }
    return { used: 0, quota: 0 };
  }
}

export const offlineService = new OfflineService();