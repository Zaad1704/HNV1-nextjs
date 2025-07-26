'use client';
import React, { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { User, Mail, Shield, Calendar } from 'lucide-react';
import UniversalCard from '@/components/common/UniversalCard';
import UniversalHeader from '@/components/common/UniversalHeader';
import UniversalStatusBadge from '@/components/common/UniversalStatusBadge';
import { useCrossData } from '@/hooks/useCrossData';

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { stats } = useCrossData();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          // Assuming /users/me or similar endpoint for user's own profile,
          // or /auth/me for current user's details
          const response = await apiClient.get(`/auth/me`); // Changed to /auth/me as it's common for current user
          setProfile(response.data.data); // Adjust based on actual API response structure
        } catch (err) {
          setError("Failed to fetch profile data.");
        }
      }
    };
    fetchProfile();
  }, [user]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg text-dark-text dark:text-dark-text-dark transition-colors duration-300">
        <div className="text-red-500 dark:text-red-500">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg text-dark-text dark:text-dark-text-dark transition-colors duration-300">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <UniversalHeader
        title="Your Profile"
        subtitle="View and manage your account information"
        icon={User}
        stats={[
          { label: 'Role', value: profile.role, color: 'blue' },
          { label: 'Status', value: 'Active', color: 'green' }
        ]}
      />
      
      <UniversalCard gradient="blue">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 gradient-dark-orange-blue rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
            {profile.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">{profile.name}</h2>
            <UniversalStatusBadge status={profile.role} variant="info" icon={Shield} />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-app-bg rounded-xl">
            <Mail size={20} className="text-blue-600" />
            <div>
              <p className="text-sm text-text-secondary">Email Address</p>
              <p className="font-medium text-text-primary">{profile.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-app-bg rounded-xl">
            <Shield size={20} className="text-green-600" />
            <div>
              <p className="text-sm text-text-secondary">Account Role</p>
              <p className="font-medium text-text-primary">{profile.role}</p>
            </div>
          </div>
        </div>
      </UniversalCard>
    </div>
  );
};

export default ProfilePage;
