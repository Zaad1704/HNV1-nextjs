// frontend/src/hooks/useOrganizations.ts
import { useState } from "react";
import apiClient from "../api/client";

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<any[]>([]);

  const fetchOrganizations = async () => {
    const res = await apiClient.get("/orgs"); // Assuming this is the endpoint for all orgs, if super admin
    setOrganizations(res.data.data); // Corrected: Access res.data.data
  };

  return { organizations, fetchOrganizations };
}
