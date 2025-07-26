import RentCollectionPeriod from '../models/RentCollectionPeriod';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
class AIInsightsService { async generateInsights(organizationId: string): Promise<any> { };
    const [collectionTrends,;
      propertyPerformance,;
      tenantBehavior,;
      marketAnalysis
    ] = await Promise.all([;
      this.analyzeCollectionTrends(organizationId),;
      this.analyzePropertyPerformance(organizationId),;
      this.analyzeTenantBehavior(organizationId),;
      this.analyzeMarketTrends(organizationId)
    ;);
    return { collectionTrends,;
      propertyPerformance,;
      tenantBehavior,;
      marketAnalysis,;
      recommendations: this.generateRecommendations({ };
        collectionTrends,;
        propertyPerformance,;
        tenantBehavior,;
        marketAnalysis
})
    };
  private async analyzeCollectionTrends(organizationId: string): Promise<any> {
const periods: await RentCollectionPeriod.find({ organizationId
})
      .sort({ 'period.year': -1, 'period.month': -1 })
      .limit(12);
    const trends: periods.map(period => ({ month : period.period.month,;
      year: period.period.year,;
      collectionRate: period.summary.collectionRate,;
      avgDaysLate: period.tenants.reduce((sum, t) => sum + t.daysLate, 0) / period.tenants.length
}
    }));
    //  Simple trend analysis;
    const recentRate: trends.slice(0, 3).reduce((sum, t) => sum + t.collectionRate, 0) / 3;
    const olderRate: trends.slice(3, 6).reduce((sum, t) => sum + t.collectionRate, 0) / 3;
    const trend: recentRate > olderRate ? 'improving' : 'declining';
    return { trends,;
      analysis: { };
        trend,;
        currentRate: recentRate,;
        change: recentRate - olderRate,;
        prediction: this.predictNextMonth(trends)};
  private async analyzePropertyPerformance(organizationId: string): Promise<any> {
const properties: await Property.find({ organizationId
}).lean();
    const performance: [];
    for(const property of properties) {
const tenants: await Tenant.find({ propertyId: property._id
}).lean();
      const payments: await Payment.find({ propertyId: property._id }).lean();
      const totalRent: tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
      const totalCollected: payments.reduce((sum, p) => sum + p.amount, 0);
      const occupancyRate: (tenants.filter(t => t.status ==: 'Active').length / property.numberOfUnits) * 100;
      performance.push({ propertyId: property._id,;
        name: property.name,;
        roi: totalRent > 0 ? (totalCollected / totalRent) * 100: 0,;
        occupancyRate,;
        tenantCount: tenants.length,;
        score: this.calculatePropertyScore(occupancyRate, totalCollected, tenants.length) }
      });
    return { properties: performance.sort((a, b) => b.score - a.score),;
      insights: {
topPerformer: performance[0],;
        underperformer: performance[performance.length - 1],;
        avgOccupancy: performance.reduce((sum, p) => sum + p.occupancyRate, 0) / performance.length
};
  private async analyzeTenantBehavior(organizationId: string): Promise<any> {
const tenants: await Tenant.find({ organizationId
}).lean();
    const behaviors: [];
    for(const tenant of tenants) {
const payments: await Payment.find({ tenantId: tenant._id
}).sort({ paymentDate: -1 }).lean();
      const latePayments: payments.filter(p => { const dueDate : new Date(p.paymentDate);
        dueDate.setDate(1); //  Assume rent due on 1st;
        return p.paymentDate > dueDate
}
      });
      behaviors.push({ tenantId: tenant._id,;
        name: tenant.name,;
        paymentReliability: payments.length > 0 ? ((payments.length - latePayments.length) / payments.length) * 100: 0,;
        avgPaymentDelay: latePayments.length > 0 ? ;
          latePayments.reduce((sum, p) => sum + this.calculateDaysLate(p.paymentDate), 0) / latePayments.length: 0,;
        riskScore: this.calculateTenantRisk(payments, latePayments) }
      });
    return { tenants: behaviors.sort((a, b) => b.riskScore - a.riskScore),;
      insights: {
highRiskCount: behaviors.filter(t: > t.riskScore > 70).length,;
        avgReliability: behaviors.reduce((sum, t) => sum + t.paymentReliability, 0) / behaviors.length,;
        trends: this.analyzeBehaviorTrends(behaviors)
};
  private async analyzeMarketTrends(organizationId: string): Promise<any> { //  Mock market analysis - in production, this would integrate with real market data APIs;
    return {
rentTrends: { currentAvgRent: 1200,;
        marketAvgRent: 1250,;
        trend: 'increasing',;
        recommendation: 'Consider 3-5% rent increase for lease renewals'
}
      },;
      occupancyTrends: { localOccupancy: 92,;
        marketOccupancy: 89,;
        trend: 'stable',;
        recommendation: 'Occupancy above market average - maintain current strategy' }
      },;
      demographics: { avgTenantAge: 32,;
        avgIncomeRange: '50k-75k',;
        preferredAmenities: ['parking', 'laundry', 'pet-friendly']
    };
  private generateRecommendations(data: any): string[] { const recommendations: [],
    //  Collection recommendations;
    if ( ) {
};
      recommendations.push('Collection rate declining - implement automated payment reminders');
    //  Property recommendations;
    if (recommendations.push('Low occupancy detected - review pricing and marketing strategy');
    //  Tenant recommendations;
    if(data.tenantBehavior.insights.highRiskCount > 0) { ) {
};
      recommendations.push(`${data.tenantBehavior.insights.highRiskCount} high-risk tenants identified - consider payment plans```