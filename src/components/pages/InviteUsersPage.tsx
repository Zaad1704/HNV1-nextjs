'use client';
import React, { useState } from "react";
import apiClient from "@/lib/api"; // Corrected: Import the default export

const InviteUsersPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("agent");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await apiClient.post("/invitations/invite-user", { email, role }); // Corrected endpoint to use the new invitation route
      setMessage(`Invitation sent to ${email}`);
      setEmail("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send invitation.");
    }
  };

  return (
    <div className="container mx-auto p-4 text-dark-text dark:text-dark-text-dark">
      <h1 className="text-2xl font-bold mb-4">Invite New User</h1>
      <form onSubmit={handleInvite} className="max-w-md bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-md border border-border-color dark:border-border-color-dark transition-all duration-200">
        {message && <div className="text-green-500 mb-4 transition-all duration-200">{message}</div>}
        {error && <div className="text-red-500 mb-4 transition-all duration-200">{error}</div>}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-light-text dark:text-light-text-dark">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 bg-light-bg dark:bg-dark-bg border border-border-color dark:border-border-color-dark rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary text-dark-text dark:text-dark-text-dark transition-all duration-200"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="role" className="block text-sm font-medium text-light-text dark:text-light-text-dark">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-border-color dark:border-border-color-dark focus:outline-none focus:ring-brand-primary focus:border-brand-primary rounded-md bg-light-bg dark:bg-dark-bg text-dark-text dark:text-dark-text-dark transition-all duration-200"
          >
            <option value="agent">Agent</option>
            {/* 'owner' might correspond to 'Landlord' role in your backend */}
            <option value="landlord">Landlord</option> 
          </select>
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors duration-200"
        >
          Send Invitation
        </button>
      </form>
    </div>
  );
};

export default InviteUsersPage;
