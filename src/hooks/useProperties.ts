// frontend/src/hooks/useProperties.ts
import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/client";

export function useProperties() {
  return useQuery(["properties"], async () => {
    const { data } = await apiClient.get("/properties");
    return data.data; // Corrected: Access data.data
  });
}
