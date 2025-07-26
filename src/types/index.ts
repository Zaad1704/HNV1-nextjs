export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  organizationId?: any;
  googleId?: string;
  isEmailVerified?: boolean;
  status?: string;
  phone?: string;
  twoFactorEnabled?: boolean;
  managedProperties?: string[];
  organization?: {
    _id: string;
    name: string;
    status: string;
  };
  subscription?: {
    status: string;
    planId: any;
    isLifetime: boolean;
    trialExpiresAt?: string;
    currentPeriodEndsAt?: string;
    cancelAtPeriodEnd?: boolean;
    canceledAt?: string;
  };
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: {
    type: 'lease_expiring' | 'payment_late' | 'rent_due' | 'maintenance_request';
    conditions: any;
  };
  actions: any[];
  isActive: boolean;
  runCount: number;
}

export interface FilterTab {
  key: string;
  label: string;
  count: number;
  active: boolean;
  icon: React.ComponentType<{ size?: number }>;
}

export interface ShareButtonProps {
  title: string;
  url?: string;
  text?: string;
  data?: any;
  type?: 'property' | 'tenant' | 'payment' | 'report' | 'receipt' | 'general';
  className?: string;
}

export interface QuickPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentAdded: () => void;
}

export interface MonthlyCollectionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
  tenants: any[];
}

export interface UniversalHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ size?: number }>;
  actions?: React.ReactNode;
}