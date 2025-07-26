import React, { useState, useEffect } from 'react';
import { MapPin, ArrowRight, Home, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import apiClient from '@/lib/api';

interface JourneyStep {
  date: string;
  type: string;
  from?: any;
  to?: any;
  rentChange?: any;
  reason?: string;
  notes?: string;
}

interface TenantJourneyMapProps {
  tenantId: string;
  tenantName: string;
}

const TenantJourneyMap: React.FC<TenantJourneyMapProps> = ({
  tenantId,
  tenantName
}) => {
  const [journeyData, setJourneyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJourney();
  }, [tenantId]);

  const fetchJourney = async () => {
    try {
      const { data } = await apiClient.get(`/cross-integration/tenant/${tenantId}/journey`);
      setJourneyData(data.data);
    } catch (error) {
      console.error('Failed to fetch tenant journey:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (type: string) => {
    const icons = {
      move_in: Home,
      move_out: Home,
      transfer: ArrowRight,
      current: MapPin
    };
    const Icon = icons[type as keyof typeof icons] || MapPin;
    return <Icon size={16} />;
  };

  const getStepColor = (type: string) => {
    const colors = {
      move_in: 'bg-green-100 text-green-800 border-green-200',
      move_out: 'bg-red-100 text-red-800 border-red-200',
      transfer: 'bg-blue-100 text-blue-800 border-blue-200',
      current: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return <div className="p-4 text-center">Loading tenant journey...</div>;
  }

  if (!journeyData) {
    return <div className="p-4 text-center text-gray-500">No journey data available</div>;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Tenant Journey - {tenantName}</h3>
          <div className="flex gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Home size={14} />
              <span>{journeyData.stats.totalMoves} moves</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{journeyData.stats.propertiesLived} properties</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp size={14} />
              <span>{journeyData.stats.avgRentIncrease.toFixed(1)}% avg increase</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {journeyData.journey.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No movement history available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {journeyData.journey.map((step: JourneyStep, index: number) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getStepColor(step.type)}`}>
                    {getStepIcon(step.type)}
                  </div>
                  {index < journeyData.journey.length - 1 && (
                    <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStepColor(step.type)}`}>
                        {step.type === 'current' ? 'Current' : step.type.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(step.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    {step.type === 'transfer' && step.from && step.to ? (
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">From:</div>
                          <div className="text-sm text-gray-600">
                            {step.from.propertyName} - Unit {step.from.unitNumber}
                            {step.from.unitNickname && ` (${step.from.unitNickname})`}
                          </div>
                        </div>
                        <ArrowRight size={20} className="text-gray-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">To:</div>
                          <div className="text-sm text-gray-600">
                            {step.to.propertyName} - Unit {step.to.unitNumber}
                            {step.to.unitNickname && ` (${step.to.unitNickname})`}
                          </div>
                        </div>
                      </div>
                    ) : step.to ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {step.type === 'current' ? 'Currently at:' : 'Moved to:'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {step.to.propertyName} - Unit {step.to.unitNumber}
                          {step.to.unitNickname && ` (${step.to.unitNickname})`}
                        </div>
                      </div>
                    ) : step.from ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">Moved from:</div>
                        <div className="text-sm text-gray-600">
                          {step.from.propertyName} - Unit {step.from.unitNumber}
                          {step.from.unitNickname && ` (${step.from.unitNickname})`}
                        </div>
                      </div>
                    ) : null}

                    {step.rentChange && (
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign size={14} className="text-green-600" />
                          <span>Rent: ${step.rentChange.newRent || step.rentChange.oldRent}</span>
                        </div>
                        {step.rentChange.changeAmount !== undefined && step.rentChange.changeAmount !== 0 && (
                          <div className={`flex items-center gap-1 ${
                            step.rentChange.changeAmount > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            <TrendingUp size={14} />
                            <span>
                              {step.rentChange.changeAmount > 0 ? '+' : ''}${step.rentChange.changeAmount}
                              ({step.rentChange.changePercentage > 0 ? '+' : ''}{step.rentChange.changePercentage.toFixed(1)}%)
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {step.reason && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Reason:</span> {step.reason}
                      </div>
                    )}

                    {step.notes && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Notes:</span> {step.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantJourneyMap;