import React, { useState, useEffect } from 'react';
import { Clock, User, DollarSign, Home, Settings, Calendar } from 'lucide-react';
import apiClient from '@/lib/api';

interface UnitHistoryEvent {
  _id: string;
  eventType: string;
  eventDate: string;
  previousData?: any;
  newData?: any;
  notes?: string;
  triggeredBy?: {
    name: string;
    email: string;
  };
}

interface UnitHistoryTimelineProps {
  unitId: string;
  unitNumber: string;
  unitNickname?: string;
}

const UnitHistoryTimeline: React.FC<UnitHistoryTimelineProps> = ({
  unitId,
  unitNumber,
  unitNickname
}) => {
  const [history, setHistory] = useState<UnitHistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [unitId]);

  const fetchHistory = async () => {
    try {
      const { data } = await apiClient.get(`/cross-integration/unit/${unitId}/history`);
      setHistory(data.data);
    } catch (error) {
      console.error('Failed to fetch unit history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    const icons = {
      tenant_moved_in: User,
      tenant_moved_out: User,
      rent_changed: DollarSign,
      unit_renovated: Home,
      status_changed: Settings,
      nickname_changed: Settings
    };
    const Icon = icons[eventType as keyof typeof icons] || Clock;
    return <Icon size={16} />;
  };

  const getEventColor = (eventType: string) => {
    const colors = {
      tenant_moved_in: 'bg-green-100 text-green-800 border-green-200',
      tenant_moved_out: 'bg-red-100 text-red-800 border-red-200',
      rent_changed: 'bg-blue-100 text-blue-800 border-blue-200',
      unit_renovated: 'bg-purple-100 text-purple-800 border-purple-200',
      status_changed: 'bg-orange-100 text-orange-800 border-orange-200',
      nickname_changed: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[eventType as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getEventTitle = (event: UnitHistoryEvent) => {
    switch (event.eventType) {
      case 'tenant_moved_in':
        return `${event.newData?.tenantName} moved in`;
      case 'tenant_moved_out':
        return `${event.previousData?.tenantName} moved out`;
      case 'rent_changed':
        return `Rent changed from $${event.previousData?.rentAmount} to $${event.newData?.rentAmount}`;
      case 'unit_renovated':
        return 'Unit renovated';
      case 'status_changed':
        return `Status changed from ${event.previousData?.status} to ${event.newData?.status}`;
      case 'nickname_changed':
        return `Nickname changed from "${event.previousData?.nickname || 'None'}" to "${event.newData?.nickname || 'None'}"`;
      default:
        return 'Unit updated';
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading unit history...</div>;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold">
          Unit History - {unitNumber}
          {unitNickname && <span className="text-gray-500"> ({unitNickname})</span>}
        </h3>
      </div>

      <div className="p-6">
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No history available for this unit</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((event, index) => (
              <div key={event._id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getEventColor(event.eventType)}`}>
                    {getEventIcon(event.eventType)}
                  </div>
                  {index < history.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
                  )}
                </div>

                <div className="flex-1 pb-8">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      {getEventTitle(event)}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {new Date(event.eventDate).toLocaleDateString()}
                    </span>
                  </div>

                  {event.notes && (
                    <p className="text-sm text-gray-600 mb-2">{event.notes}</p>
                  )}

                  {event.triggeredBy && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <User size={12} />
                      <span>by {event.triggeredBy.name}</span>
                    </div>
                  )}

                  {event.eventType === 'rent_changed' && event.previousData && event.newData && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span>Previous: ${event.previousData.rentAmount}</span>
                        <span>New: ${event.newData.rentAmount}</span>
                        <span className="font-medium">
                          Change: ${event.newData.rentAmount - event.previousData.rentAmount}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitHistoryTimeline;