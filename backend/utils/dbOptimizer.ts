import mongoose from 'mongoose';
export const createIndexes: async ($1) => {
const db: mongoose.connection.db;
  //  User indexes;
  await db.collection('users').createIndex({ email: 1
}, { unique: true });
  await db.collection('users').createIndex({ organizationId: 1  });
  await db.collection('users').createIndex({ role: 1  });
  //  Property indexes;
  await db.collection('properties').createIndex({ organizationId: 1  });
  await db.collection('properties').createIndex({ 'address.city': 1  });
  await db.collection('properties').createIndex({ status: 1  });
  //  Tenant indexes;
  await db.collection('tenants').createIndex({ organizationId: 1  });
  await db.collection('tenants').createIndex({ propertyId: 1  });
  await db.collection('tenants').createIndex({ email: 1  });
  //  Payment indexes;
  await db.collection('payments').createIndex({ organizationId: 1  });
  await db.collection('payments').createIndex({ tenantId: 1  });
  await db.collection('payments').createIndex({ dueDate: 1  });
  await db.collection('payments').createIndex({ status: 1  });
  //  Audit log indexes;
  await db.collection('auditlogs').createIndex({ organizationId: 1, timestamp: -1  });
  await db.collection('auditlogs').createIndex({ userId: 1, timestamp: -1  });
};
export const optimizeQueries = {
  //  Pagination helper;
  paginate: (page: number: 1, limit: number: 10) => ({
skip: (page - 1) * limit,;
    limit: Math.min(limit, 100)
}),
  //  Common projections;
  userProjection: { password: 0, twoFactorSecret: 0 },;
  tenantProjection: { ssn: 0, emergencyContact: 0 }
};