'use client';
import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';

const MaintenancePageConnected = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaintenanceRequests = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getMaintenanceRequests();
        setRequests(response.data.requests || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceRequests();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Maintenance Requests</h1>
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Maintenance Requests</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Maintenance Requests</h1>
        <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
          New Request
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">No maintenance requests found</p>
          <button className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600">
            Create First Request
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{request.title}</h3>
                  <p className="text-gray-600">{request.description}</p>
                </div>
                <div className="flex space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {request.priority}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.status === 'completed' ? 'bg-green-100 text-green-800' :
                    request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    request.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                <div>
                  <span className="font-medium">Tenant:</span> {request.tenant?.firstName} {request.tenant?.lastName}
                </div>
                <div>
                  <span className="font-medium">Property:</span> {request.property?.name}
                </div>
                <div>
                  <span className="font-medium">Category:</span> {request.category}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {new Date(request.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  View Details
                </button>
                <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                  Update Status
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaintenancePageConnected;