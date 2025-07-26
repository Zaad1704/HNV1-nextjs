'use client';
// frontend/src/pages/OrganizationPage.tsx
import React, { useEffect, useState } from "react";
import apiClient from "../api/client";
import OrgSwitcher from "../components/OrgSwitcher";
import { useAuthStore } from "../store/authStore"; // Import useAuthStore

// Update Org type to match the expected populated data from backend
type Org = {
  _id: string; // Changed from id to _id to match MongoDB convention
  name: string;
  owner: { name: string; email: string; }; // Expecting an object now
  members?: string[]; // Assuming members might be populated or just IDs
  status?: string;
  subscription?: { // Assuming subscription might be populated
    planId?: { name: string; price: number; duration: string; };
    status: string;
  };
  branding?: {
    companyName: string;
  };
};

const OrganizationPage: React.FC = () => {
  const { user } = useAuthStore(); // Get user from auth store
  const [org, setOrg] = useState<Org | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOrg = async () => {
      if (!user?.organizationId) { // Ensure user and organizationId exist
        setError("User organization not found.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Fetch specific organization details, if you have a specific org endpoint for 'me'
        // or re-use the super-admin endpoint with proper authorization and filtering.
        // Given your backend /orgs/me is simplified, we'll hit that.
        const response = await apiClient.get("/orgs/me"); // Use /api/orgs/me endpoint
        setOrg(response.data.data); // Access data.data as per new backend response
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch organization data.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrg();
  }, [user?.organizationId]); // Re-fetch when organizationId changes

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg text-dark-text dark:text-dark-text-dark transition-colors duration-300">
        <div>Loading organization details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg text-dark-text dark:text-dark-text-dark transition-colors duration-300">
        <div className="text-red-500 dark:text-red-500">{error}</div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg text-dark-text dark:text-dark-text-dark transition-colors duration-300">
        <div>No organization data found.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 text-dark-text dark:text-dark-text-dark">
      {/* <OrgSwitcher /> Uncomment if you want to allow switching orgs */}
      <h1 className="text-2xl font-bold mb-4">Organization Details: {org.name}</h1>
      <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-md border border-border-color dark:border-border-color-dark transition-all duration-200">
        <p>
          <strong>ID:</strong> {org._id}
        </p>
        <p>
          <strong>Name:</strong> {org.name}
        </p>
        <p>
          <strong>Owner:</strong> {org.owner?.name || 'N/A'} ({org.owner?.email || 'N/A'})
        </p>
        {org.status && (
          <p>
            <strong>Status:</strong> {org.status}
          </p>
        )}
        {org.subscription && (
          <div>
            <p>
              <strong>Current Plan:</strong> {org.subscription.planId?.name || 'N/A'}
            </p>
            {org.subscription.planId?.price !== undefined && (
                <p>
                  <strong>Plan Price:</strong> ${ (org.subscription.planId.price / 100).toFixed(2) } / {org.subscription.planId.duration}
                </p>
            )}
            <p>
              <strong>Subscription Status:</strong> {org.subscription.status}
            </p>
          </div>
        )}
        {org.branding && org.branding.companyName && (
          <p>
            <strong>Company Name (Branding):</strong> {org.branding.companyName}
          </p>
        )}
      </div>
    </div>
  );
};

export default OrganizationPage;
