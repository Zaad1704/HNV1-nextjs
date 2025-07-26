import Analytics from '../models/Analytics';
import { Request } from 'express';

class AnalyticsService {
  async track(event: string, properties: any, req: Request, userId?: string, organizationId?: string) {
    try {
      await Analytics.create({
        userId,
        organizationId,
        event,
        category: this.categorizeEvent(event),
        properties,
        sessionId: req.sessionID || 'anonymous',
        userAgent: req.get('User-Agent') || '',
        ipAddress: req.ip || '',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  private categorizeEvent(event: string): string {
    if (event.includes('page_')) return 'page_view';
    if (event.includes('error_')) return 'error';
    if (event.includes('performance_')) return 'performance';
    if (event.includes('feature_')) return 'feature_usage';
    return 'user_action';
  }

  async getStats(organizationId?: string, days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const match = organizationId ? { organizationId, timestamp: { $gte: startDate } } : { timestamp: { $gte: startDate } };

    const [pageViews, userActions, errors] = await Promise.all([
      Analytics.countDocuments({ ...match, category: 'page_view' }),
      Analytics.countDocuments({ ...match, category: 'user_action' }),
      Analytics.countDocuments({ ...match, category: 'error' })
    ]);

    const topPages = await Analytics.aggregate([
      { $match: { ...match, category: 'page_view' } },
      { $group: { _id: '$properties.page', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    return { pageViews, userActions, errors, topPages };
  }
}

export default new AnalyticsService();