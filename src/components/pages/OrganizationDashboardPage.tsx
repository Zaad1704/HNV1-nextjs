'use client';
import React, { useEffect, useState } from "react";
import { useOrgStore } from "@/store/orgStore";
import apiClient from "@/lib/api";
import OrgSwitcher from "@/components/OrgSwitcher";

const OrganizationDashboardPage: React.FC = () => {
  const { orgs, setOrgs, currentOrg, persistCurrentOrg } = useOrgStore();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    apiClient.get("/orgs/me")
      .then(res => {
        if (res.data.success && res.data.data) {
          setOrgs(res.data.data);
          if (res.data.data.length && !currentOrg) {
            const persisted = localStorage.getItem("currentOrgId");
            const found = res.data.data.find((o: any) => o._id === persisted);
            persistCurrentOrg(found || res.data.data[0]);
          }
        }
      })
      .catch(error => {
        console.error('Failed to fetch organizations:', error);
      });
  }, []);

  useEffect(() => {
    if (currentOrg) {
      apiClient.get(`/dashboard/overview-stats`).then(res => setStats(res.data.data)); // Use dashboard overview stats
    }
  }, [currentOrg]);

  if (!currentOrg) return <div className="p-8 text-dark-text dark:text-dark-text-dark">No organization selected.</div>;

  return (
    <div className="p-8 text-dark-text dark:text-dark-text-dark">
      <OrgSwitcher />
      <h1 className="text-2xl mb-4">{currentOrg.name} Dashboard</h1>
      {stats ? (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-md border border-border-color dark:border-border-color-dark transition-all duration-200">
          <div className="mb-2"><strong className="text-dark-text dark:text-dark-text-dark">Total Properties:</strong> <span className="text-light-text dark:text-light-text-dark">{stats.totalProperties}</span></div>
          <div className="mb-2"><strong className="text-dark-text dark:text-dark-text-dark">Active Tenants:</strong> <span className="text-light-text dark:text-light-text-dark">{stats.activeTenants}</span></div>
          <div className="mb-2"><strong className="text-dark-text dark:text-dark-text-dark">Monthly Revenue:</strong> <span className="text-light-text dark:text-light-text-dark">${stats.monthlyRevenue?.toLocaleString() || 0}</span></div>
          <div className="mb-2"><strong className="text-dark-text dark:text-dark-text-dark">Occupancy Rate:</strong> <span className="text-light-text dark:text-light-text-dark">{stats.occupancyRate}</span></div>
        </div>
      ) : (
        <div className="text-light-text dark:text-light-text-dark">Loading organization stats...</div>
      )}
    </div>
  );
};

export default OrganizationDashboardPage;
