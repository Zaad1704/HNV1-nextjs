import { create } from "zustand";

export interface Org {
  _id: string;
  name: string;
  status: string;
}

interface OrgState {
  orgs: Org[];
  currentOrg: Org | null;
  setOrgs: (orgs: Org[]) => void;
  setCurrentOrg: (org: Org) => void;
  persistCurrentOrg: (org: Org) => void;
  loadPersistedOrg: () => void;
}

export const useOrgStore = create<OrgState>((set) => ({
  orgs: [],
  currentOrg: null,
  setOrgs: (orgs) => set({ orgs }),
  setCurrentOrg: (org) => set({ currentOrg: org }),
  persistCurrentOrg: (org) => {
    localStorage.setItem("currentOrgId", org._id);
    set({ currentOrg: org });
  },
  loadPersistedOrg: () => {
    const orgId = localStorage.getItem("currentOrgId");
    if (orgId) set((state) => ({
      currentOrg: state.orgs.find((o) => o._id === orgId) || null
    }));
  }
}));