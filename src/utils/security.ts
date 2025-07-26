export const rateLimiter = {
  requests: new Map<string, number[]>(),
  
  isAllowed(url: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const key = url;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const requests = this.requests.get(key)!;
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
};