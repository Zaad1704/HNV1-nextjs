import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string) {
    if (this.socket?.connected) return;

    const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
    
    this.socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts
    });

    this.socket.on('connect', () => {

      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {

    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
    });

    // Real-time event listeners
    this.socket.on('payment_received', (data) => {
      this.emit('notification', {
        type: 'success',
        title: 'Payment Received',
        message: `Payment of $${data.amount} received from ${data.tenantName}`,
        data
      });
    });

    this.socket.on('maintenance_request', (data) => {
      this.emit('notification', {
        type: 'warning',
        title: 'New Maintenance Request',
        message: `${data.issue} - ${data.propertyName}`,
        data
      });
    });

    this.socket.on('lease_expiring', (data) => {
      this.emit('notification', {
        type: 'info',
        title: 'Lease Expiring Soon',
        message: `${data.tenantName}'s lease expires in ${data.daysLeft} days`,
        data
      });
    });

    this.socket.on('rent_overdue', (data) => {
      this.emit('notification', {
        type: 'error',
        title: 'Rent Overdue',
        message: `${data.tenantName} has overdue rent payment`,
        data
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Join organization room for targeted notifications
  joinOrganization(organizationId: string) {
    this.emit('join_organization', { organizationId });
  }

  // Leave organization room
  leaveOrganization(organizationId: string) {
    this.emit('leave_organization', { organizationId });
  }

  // Send real-time updates
  sendPropertyUpdate(propertyId: string, update: any) {
    this.emit('property_update', { propertyId, update });
  }

  sendTenantUpdate(tenantId: string, update: any) {
    this.emit('tenant_update', { tenantId, update });
  }

  sendPaymentUpdate(paymentId: string, update: any) {
    this.emit('payment_update', { paymentId, update });
  }
}

export default new SocketService();