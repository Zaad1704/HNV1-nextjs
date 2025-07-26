/**
 * This utility ensures that universal pages are always enabled
 * It runs on application startup to set the correct feature flags in localStorage
 */

export const ensureUniversalPagesEnabled = (): void => {
  try {
    // Define the correct feature flags
    const correctFlags = {
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
      universalSettings: true
    };
    
    // Save to localStorage
    localStorage.setItem('featureFlags', JSON.stringify(correctFlags));
    console.log('Universal pages feature flags have been set correctly');
  } catch (error) {
    console.error('Error setting universal pages feature flags:', error);
  }
};