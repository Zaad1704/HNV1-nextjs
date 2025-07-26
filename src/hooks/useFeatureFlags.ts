import { useState, useEffect } from 'react';

interface FeatureFlags {
  universalPages: boolean;
  universalPayments: boolean;
  universalExpenses: boolean;
  universalMaintenance: boolean;
  universalReceipts: boolean;
  universalCashflow: boolean;
  universalReminders: boolean;
  universalApprovals: boolean;
  universalUsers: boolean;
  universalAuditLog: boolean;
  universalSettings: boolean;
}

/**
 * Hook to manage feature flags for the application
 * This allows enabling/disabling features dynamically
 */
export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlags>({
    universalPages: true, // Master toggle for all universal pages
    universalPayments: true,
    universalExpenses: true,
    universalMaintenance: true,
    universalReceipts: true,
    universalCashflow: true,
    universalReminders: true,
    universalApprovals: true,
    universalUsers: true,
    universalAuditLog: true,
    universalSettings: true,
  });

  // Load flags from localStorage on mount
  useEffect(() => {
    try {
      const savedFlags = localStorage.getItem('featureFlags');
      console.log('Loaded feature flags from localStorage:', savedFlags);
      
      if (savedFlags) {
        const parsedFlags = JSON.parse(savedFlags);
        console.log('Parsed feature flags:', parsedFlags);
        setFlags(parsedFlags);
      } else {
        // If no flags in localStorage, set the defaults and save them
        console.log('No saved flags found, using defaults:', flags);
        localStorage.setItem('featureFlags', JSON.stringify(flags));
      }
    } catch (error) {
      console.error('Error loading feature flags:', error);
    }
  }, []);

  // Save flags to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('featureFlags', JSON.stringify(flags));
    } catch (error) {
      console.error('Error saving feature flags:', error);
    }
  }, [flags]);

  const updateFlag = (flagName: keyof FeatureFlags, value: boolean) => {
    setFlags(prev => ({
      ...prev,
      [flagName]: value
    }));
  };

  const toggleFlag = (flagName: keyof FeatureFlags) => {
    setFlags(prev => ({
      ...prev,
      [flagName]: !prev[flagName]
    }));
  };

  // Function to reset all flags to default values
  const resetFlags = () => {
    const defaultFlags: FeatureFlags = {
      universalPages: true,
      universalPayments: true,
      universalExpenses: true,
      universalMaintenance: true,
      universalReceipts: true,
      universalCashflow: true,
      universalReminders: true,
      universalApprovals: true,
      universalUsers: true,
      universalAuditLog: true,
      universalSettings: true,
    };
    
    setFlags(defaultFlags);
    localStorage.setItem('featureFlags', JSON.stringify(defaultFlags));
    console.log('Feature flags reset to defaults');
  };

  return {
    flags,
    updateFlag,
    toggleFlag,
    resetFlags,
    isUniversalPageEnabled: (pageName: 'payments' | 'expenses' | 'maintenance' | 'receipts' | 'cashflow' | 'reminders' | 'approvals' | 'users' | 'auditLog' | 'settings'): boolean => {
      // Always return true to ensure universal pages are always enabled
      // This overrides the feature flags but keeps the original code intact for future reference
      return true;
      
      /* Original implementation kept for reference:
      const flagKey = `universal${pageName.charAt(0).toUpperCase() + pageName.slice(1)}` as keyof FeatureFlags;
      
      // Always return true for auditLog and settings to ensure they're always visible
      if (pageName === 'auditLog' || pageName === 'settings') {
        return true;
      }
      
      // For other pages, check both the master toggle and the specific page toggle
      console.log(`Checking ${pageName}: Master=${flags.universalPages}, Specific=${flags[flagKey]}`);
      
      // Ensure the flag exists before checking it
      return flags.universalPages && flags[flagKey];
      */
    }
  };
};