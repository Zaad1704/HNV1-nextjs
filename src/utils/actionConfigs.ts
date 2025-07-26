import { 
  Edit, 
  Trash2, 
  Archive, 
  Eye, 
  DollarSign, 
  FileText, 
  Share2, 
  Download, 
  Copy, 
  Star,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Settings,
  Users,
  CreditCard,
  Receipt,
  TrendingUp,
  Home,
  Key,
  Wrench,
  Camera,
  MessageSquare,
  Bell,
  Shield,
  BarChart3,
  Clock,
  UserCheck
} from 'lucide-react';

export const getPropertyActions = (property: any, handlers: any) => [
  {
    id: 'view',
    label: 'View Details',
    icon: Eye,
    onClick: () => handlers.onView?.(property),
    gradient: 'linear-gradient(135deg, #10B981, #059669)'
  },
  {
    id: 'edit',
    label: 'Edit Property',
    icon: Edit,
    onClick: () => handlers.onEdit?.(property),
    gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)'
  },
  {
    id: 'payment',
    label: 'Payment History',
    icon: CreditCard,
    onClick: () => handlers.onPayment?.(property),
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)'
  },

  {
    id: 'tenants',
    label: 'Manage Tenants',
    icon: Users,
    onClick: () => handlers.onTenants?.(property),
    gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)'
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    icon: Wrench,
    onClick: () => handlers.onMaintenance?.(property),
    gradient: 'linear-gradient(135deg, #EF4444, #DC2626)'
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    onClick: () => handlers.onDocuments?.(property),
    gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)'
  },
  {
    id: 'photos',
    label: 'Photo Gallery',
    icon: Camera,
    onClick: () => handlers.onPhotos?.(property),
    gradient: 'linear-gradient(135deg, #EC4899, #DB2777)'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    onClick: () => handlers.onAnalytics?.(property),
    gradient: 'linear-gradient(135deg, #84CC16, #65A30D)'
  },
  {
    id: 'lease',
    label: 'Lease Management',
    icon: Key,
    onClick: () => handlers.onLease?.(property),
    gradient: 'linear-gradient(135deg, #F97316, #EA580C)'
  },
  {
    id: 'share',
    label: 'Share Property',
    icon: Share2,
    onClick: () => handlers.onShare?.(property),
    gradient: 'linear-gradient(135deg, #14B8A6, #0D9488)'
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    icon: Copy,
    onClick: () => handlers.onDuplicate?.(property),
    gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)'
  },
  {
    id: 'favorite',
    label: 'Add to Favorites',
    icon: Star,
    onClick: () => handlers.onFavorite?.(property),
    gradient: 'linear-gradient(135deg, #FBBF24, #F59E0B)'
  },
  {
    id: 'archive',
    label: property.status === 'Archived' ? 'Restore' : 'Archive',
    icon: Archive,
    onClick: () => handlers.onArchive?.(property),
    gradient: 'linear-gradient(135deg, #6B7280, #4B5563)'
  },
  {
    id: 'delete',
    label: 'Delete Property',
    icon: Trash2,
    onClick: () => handlers.onDelete?.(property),
    dangerous: true
  }
];

export const getTenantActions = (tenant: any, handlers: any) => [
  {
    id: 'view',
    label: 'View Profile',
    icon: Eye,
    onClick: () => handlers.onView?.(tenant),
    gradient: 'linear-gradient(135deg, #10B981, #059669)'
  },
  {
    id: 'edit',
    label: 'Edit Tenant',
    icon: Edit,
    onClick: () => handlers.onEdit?.(tenant),
    gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)'
  },
  {
    id: 'payment',
    label: 'Payment History',
    icon: Receipt,
    onClick: () => handlers.onPayment?.(tenant),
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)'
  },
  {
    id: 'collect-payment',
    label: 'Collect Payment',
    icon: DollarSign,
    onClick: () => handlers.onCollectPayment?.(tenant),
    gradient: 'linear-gradient(135deg, #059669, #047857)'
  },

  {
    id: 'lease',
    label: 'Lease Agreement',
    icon: FileText,
    onClick: () => handlers.onLease?.(tenant),
    gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)'
  },
  {
    id: 'contact',
    label: 'Contact Tenant',
    icon: MessageSquare,
    onClick: () => handlers.onContact?.(tenant),
    gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)'
  },
  {
    id: 'call',
    label: 'Call Tenant',
    icon: Phone,
    onClick: () => handlers.onCall?.(tenant),
    gradient: 'linear-gradient(135deg, #10B981, #059669)'
  },
  {
    id: 'email',
    label: 'Send Email',
    icon: Mail,
    onClick: () => handlers.onEmail?.(tenant),
    gradient: 'linear-gradient(135deg, #EF4444, #DC2626)'
  },
  {
    id: 'schedule',
    label: 'Schedule Visit',
    icon: Calendar,
    onClick: () => handlers.onSchedule?.(tenant),
    gradient: 'linear-gradient(135deg, #F97316, #EA580C)'
  },
  {
    id: 'maintenance',
    label: 'Maintenance Request',
    icon: Wrench,
    onClick: () => handlers.onMaintenance?.(tenant),
    gradient: 'linear-gradient(135deg, #DC2626, #B91C1C)'
  },
  {
    id: 'notifications',
    label: 'Send Notice',
    icon: Bell,
    onClick: () => handlers.onNotification?.(tenant),
    gradient: 'linear-gradient(135deg, #EC4899, #DB2777)'
  },
  {
    id: 'background-check',
    label: 'Background Check',
    icon: Shield,
    onClick: () => handlers.onBackgroundCheck?.(tenant),
    gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)'
  },
  {
    id: 'move-out',
    label: 'Move Out Process',
    icon: Home,
    onClick: () => handlers.onMoveOut?.(tenant),
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)'
  },
  {
    id: 'renew-lease',
    label: 'Renew Lease',
    icon: UserCheck,
    onClick: () => handlers.onRenewLease?.(tenant),
    gradient: 'linear-gradient(135deg, #84CC16, #65A30D)'
  },
  {
    id: 'delete',
    label: 'Remove Tenant',
    icon: Trash2,
    onClick: () => handlers.onDelete?.(tenant),
    dangerous: true
  }
];