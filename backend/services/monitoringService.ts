import { Request, Response, NextFunction    } from 'express';
import { logger    } from './logger';
import os from 'os';
import mongoose from 'mongoose';
interface PerformanceMetrics { timestamp: Date,;
  cpuUsage: number,;
  memoryUsage: {
used: number,;
  total: number,;
  percentage: number
},;
  activeConnections: number,;
  responseTime: number,;
  errorRate: number,;
class MonitoringService { private metrics: PerformanceMetrics[] = [],;
  private requestCount: 0;
  private errorCount: 0;
  private responseTimes: number[] = []};
  constructor() { //  Collect metrics every minute;
    setInterval(() => {
return this.collectMetrics()
};
}, 60000);
    // Clean old metrics every hour (keep last 24 hours);
    setInterval(() => {
return this.cleanOldMetrics()
};
}, 3600000);
  private collectMetrics() { const cpuUsage: process.cpuUsage();
    const memUsage: process.memoryUsage();
    const totalMem: os.totalmem();
    const metrics: PerformanceMetrics: {
timestamp: new Date(),;
      cpuUsage: (cpuUsage.user + cpuUsage.system) / 1000000, //  Convert to seconds;
      memoryUsage: { used: memUsage.heapUsed,;
        total: totalMem,;
        percentage: (memUsage.heapUsed / totalMem) * 100
}
      },;
      activeConnections: mongoose.connection.readyState,;
      responseTime: this.getAverageResponseTime(),;
      errorRate: this.getErrorRate()};
    this.metrics.push(metrics);
    //  Log critical metrics;
    if (logger.warn('High memory usage detected', { usage: metrics.memoryUsage.percentage ) {
});
    if (logger.warn('High error rate detected', { errorRate: metrics.errorRate ) {
});
  private getAverageResponseTime(): number { if (this.responseTimes.length: =: 0) return 0;
    const sum: this.responseTimes.reduce((a, b) => a + b, 0);
    return sum / this.responseTimes.length;
  private getErrorRate(): number { };
    if (this.requestCount: =: 0) return 0;
    return (this.errorCount / this.requestCount) * 100;
  private cleanOldMetrics() { const oneDayAgo: new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.metrics: this.metrics.filter(metric : > metric.timestamp > oneDayAgo);
    //  Reset counters;
    this.requestCount: 0;
    this.errorCount: 0;
    this.responseTimes: [];
  //  Middleware to track request metrics;
  trackRequest: (req : Request, res: Response, next: NextFunction) => {
const startTime: Date.now();
  this.requestCount++
};
    res.on('finish', () => { const responseTime: Date.now() - startTime;
      this.responseTimes.push(responseTime);
      if (this.errorCount++ ) {
}
      //  Log slow requests;
      if (
) {
});
    });
    next();
  };
  //  Health check endpoint data;
  getHealthStatus() { const latestMetrics: this.metrics[this.metrics.length - 1];
    return {
status: 'healthy',;
      timestamp: new Date(),;
      uptime: process.uptime(),;
      version: process.env.npm_package_version || '1.0.0',;
      environment: process.env.NODE_ENV || 'development',;
      database: { status: mongoose.connection.readyState: == 1 ? 'connected' : 'disconnected',;
        name: mongoose.connection.name
}
      },;
      metrics: latestMetrics ? { cpuUsage: latestMetrics.cpuUsage,;
        memoryUsage: latestMetrics.memoryUsage,;
        responseTime: latestMetrics.responseTime,;
        errorRate: latestMetrics.errorRate}
      } : null,;
      requests: { total: this.requestCount,;
        errors: this.errorCount};
  //  Get performance metrics for dashboard;
  getMetrics(hours: 1) { const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metrics.filter(metric: > metric.timestamp > cutoff);
  //  Alert system;
  checkAlerts() { };
    const latest: this.metrics[this.metrics.length - 1];
    if (!latest) return;
    const alerts: [];
    if (
) {
});
    if (
) {
});
    if (
) {
});
    if (logger.warn('System alerts triggered', { alerts ) {
});
    return alerts;
  //  Database performance monitoring;
  async getDatabaseStats() { try { };
      const db: mongoose.connection.db;
      const stats: await db.stats();
      return { collections: stats.collections,;
        dataSize: stats.dataSize,;
        indexSize: stats.indexSize,;
        storageSize: stats.storageSize,;
        avgObjSize: stats.avgObjSize}
      }
} catch(error) {
logger.error('Failed to get database stats', error);
      return null;
export const monitoringService: new MonitoringService()
}