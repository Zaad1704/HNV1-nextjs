import { useState } from "react";
import apiClient from "../api/client";

export function useUsers() {
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    // Corrected the endpoint to match the new route
    const res = await apiClient.get("/users/organization"); 
    setUsers(res.data.data); // Assuming the backend returns { success: true, data: [...] }
  };

  return { users, fetchUsers };
}
