// Mock data for development when backend endpoints are not available
export const mockData = {
  properties: [
    {
      _id: '1',
      name: 'Sunset Apartments',
      address: { formattedAddress: '123 Main St, City, State', city: 'City' },
      numberOfUnits: 12,
      status: 'Active',
      imageUrl: null
    },
    {
      _id: '2', 
      name: 'Downtown Complex',
      address: { formattedAddress: '456 Oak Ave, City, State', city: 'City' },
      numberOfUnits: 8,
      status: 'Active',
      imageUrl: null
    }
  ],
  tenants: [
    {
      _id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      phone: '555-0123',
      unit: 'A1',
      status: 'Active',
      propertyId: { name: 'Sunset Apartments' },
      rentAmount: 1200,
      leaseEndDate: '2024-12-31'
    },
    {
      _id: '2',
      name: 'Jane Doe', 
      email: 'jane@example.com',
      phone: '555-0124',
      unit: 'B2',
      status: 'Active',
      propertyId: { name: 'Downtown Complex' },
      rentAmount: 1500,
      leaseEndDate: '2024-11-30'
    }
  ],
  payments: [
    {
      _id: '1',
      amount: 1200,
      date: '2024-01-01',
      status: 'Completed',
      tenantId: { name: 'John Smith' }
    },
    {
      _id: '2',
      amount: 1500,
      date: '2024-01-01', 
      status: 'Completed',
      tenantId: { name: 'Jane Doe' }
    }
  ],
  expenses: [
    {
      _id: '1',
      amount: 500,
      description: 'Plumbing repair',
      date: '2024-01-15',
      category: 'Maintenance',
      propertyId: { name: 'Sunset Apartments' }
    },
    {
      _id: '2',
      amount: 300,
      description: 'Landscaping',
      date: '2024-01-10',
      category: 'Maintenance', 
      propertyId: { name: 'Downtown Complex' }
    }
  ],
  overviewStats: {
    totalProperties: 2,
    activeTenants: 2,
    monthlyRevenue: 2700,
    occupancyRate: '85%'
  },
  cashflow: {
    income: 2700,
    expenses: 800,
    netFlow: 1900,
    monthlyData: [
      { month: 'January', income: 2700, expenses: 800, net: 1900 }
    ]
  },
  reminders: [
    {
      _id: '1',
      title: 'Rent Due Reminder',
      message: 'Monthly rent payment is due',
      status: 'Active',
      frequency: 'Monthly',
      nextSend: '2024-02-01',
      tenantId: { name: 'All Tenants' }
    }
  ],
  approvals: [
    {
      _id: '1',
      type: 'Maintenance Request',
      description: 'Approve plumbing repair for unit A1',
      status: 'Pending',
      requestedBy: { name: 'John Smith' },
      propertyId: { name: 'Sunset Apartments' },
      createdAt: '2024-01-20'
    }
  ],
  users: [
    {
      _id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'Landlord',
      status: 'active'
    }
  ],
  subscription: {
    planName: 'Free Trial',
    amount: 0,
    status: 'trialing',
    nextBilling: '2024-02-15',
    usage: { properties: 2, users: 1, storage: 0.5 },
    limits: { properties: 5, users: 3, storage: 10 }
  },
  invoices: [],
  auditLogs: [
    {
      _id: '1',
      action: 'login',
      description: 'User logged in',
      user: { name: 'Admin User' },
      timestamp: '2024-01-20T10:00:00Z'
    }
  ]
};

export const useMockData = () => {
  return {
    get: (endpoint: string) => {
      const path = endpoint.replace('/api/', '').replace('dashboard/', '');
      
      switch (path) {
        case 'properties': return mockData.properties;
        case 'tenants': return mockData.tenants;
        case 'payments': return mockData.payments;
        case 'expenses': return mockData.expenses;
        case 'overview-stats': return mockData.overviewStats;
        case 'cashflow': return mockData.cashflow;
        case 'reminders': return mockData.reminders;
        case 'approvals': return mockData.approvals;
        case 'users': return mockData.users;
        case 'billing/subscription': return mockData.subscription;
        case 'billing/invoices': return mockData.invoices;
        case 'audit-logs': return mockData.auditLogs;
        case 'maintenance': return [];
        case 'late-tenants': return [];
        case 'expiring-leases': return [];
        case 'financial-summary': return [];
        case 'rent-status': return [];
        default: return [];
      }
    }
  };
};