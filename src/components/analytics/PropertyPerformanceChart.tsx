import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Building2, DollarSign, Users, Clock } from 'lucide-react';
import apiClient from '@/lib/api';

interface PropertyPerformance {
  propertyId: string;
  propertyName: string;
  occupancyRate: number;
  totalRevenue: number;
  avgStayDuration: number;
  totalUnits: number;
  occupiedUnits: number;
  score: number;
}

const PropertyPerformanceChart: React.FC = () => {
  const [properties, setProperties] = useState<PropertyPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMetric, setSortMetric] = useState<'occupancy' | 'revenue' | 'score'>('score');

  useEffect(() => {
    fetchPerformance();
  }, [sortMetric]);

  const fetchPerformance = async () => {
    try {
      const { data } = await apiClient.get(`/advanced-analytics/property-performance?metric=${sortMetric}`);
      setProperties(data.data);
    } catch (error) {
      console.error('Failed to fetch property performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPerformanceLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Attention';
  };

  if (loading) {
    return <div className="p-4 text-center">Loading property performance...</div>;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="text-blue-600" size={20} />
            Property Performance Comparison
          </h3>
          <div className="flex gap-2">
            {[
              { key: 'score', label: 'Score' },
              { key: 'occupancy', label: 'Occupancy' },
              { key: 'revenue', label: 'Revenue' }
            ].map((metric) => (
              <button
                key={metric.key}
                onClick={() => setSortMetric(metric.key as any)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  sortMetric === metric.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {metric.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {properties.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Building2 size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No property performance data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property, index) => (
              <div key={property.propertyId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{property.propertyName}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          property.score >= 80 ? 'bg-green-100 text-green-800' :
                          property.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {getPerformanceLabel(property.score)}
                        </span>
                        <span>Score: {property.score.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{property.occupancyRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-500">Occupancy</div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mx-auto mb-2">
                      <Building2 size={20} className="text-blue-600" />
                    </div>
                    <div className="text-sm font-medium">{property.occupiedUnits}/{property.totalUnits}</div>
                    <div className="text-xs text-gray-500">Units</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mx-auto mb-2">
                      <DollarSign size={20} className="text-green-600" />
                    </div>
                    <div className="text-sm font-medium">${property.totalRevenue.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Revenue</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg mx-auto mb-2">
                      <Clock size={20} className="text-purple-600" />
                    </div>
                    <div className="text-sm font-medium">{property.avgStayDuration.toFixed(1)}mo</div>
                    <div className="text-xs text-gray-500">Avg Stay</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg mx-auto mb-2">
                      <TrendingUp size={20} className="text-orange-600" />
                    </div>
                    <div className="text-sm font-medium">{property.score.toFixed(0)}</div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                </div>

                {/* Performance Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Performance</span>
                    <span>{property.score.toFixed(1)}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getPerformanceColor(property.score)}`}
                      style={{ width: `${property.score}%` }}
                    />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-4">
                  <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                    View Details
                  </button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                    Generate Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyPerformanceChart;