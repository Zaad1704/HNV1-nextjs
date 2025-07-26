'use client';
import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';

const PropertiesPageConnected = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getProperties();
        setProperties(response.data.properties || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Properties</h1>
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Properties</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Properties</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          Add Property
        </button>
      </div>

      {properties.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">No properties found</p>
          <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
            Add Your First Property
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property._id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">{property.name}</h3>
              <p className="text-gray-600 mb-4">
                {property.address?.street}, {property.address?.city}
              </p>
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>Type: {property.type}</span>
                <span>Units: {property.units?.length || 0}</span>
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                  View Details
                </button>
                <button className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertiesPageConnected;