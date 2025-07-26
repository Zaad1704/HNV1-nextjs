import React, { useEffect } from "react";
import { useOrgStore } from "../store/orgStore";

const OrgSwitcher: React.FC = () => {
  const { orgs, currentOrg, persistCurrentOrg, loadPersistedOrg } = useOrgStore();

  useEffect(() => {
    loadPersistedOrg();
  }, [orgs.length, loadPersistedOrg]); // Added loadPersistedOrg to dependency array

  if (orgs.length < 2) return null;

  return (
    <div className="mb-4 text-dark-text dark:text-dark-text-dark">
      <label className="mr-2 font-semibold">Organization:</label>
      <select
        className="border border-border-color dark:border-border-color-dark p-1 bg-light-card dark:bg-dark-card rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200"
        value={currentOrg?._id || ""}
        onChange={e => {
          const selected = orgs.find((o) => o._id === e.target.value);
          if (selected) persistCurrentOrg(selected);
        }}
      >
        {orgs.map((org) => (
          <option key={org._id} value={org._id}>{org.name}</option>
        ))}
      </select>
    </div>
  );
};

export default OrgSwitcher;
