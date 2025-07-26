// MongoDB initialization script
db = db.getSiblingDB('hnv1-nextjs');

// Create collections
db.createCollection('users');
db.createCollection('organizations');
db.createCollection('properties');
db.createCollection('tenants');
db.createCollection('payments');
db.createCollection('expenses');
db.createCollection('maintenancerequests');
db.createCollection('notifications');
db.createCollection('auditlogs');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "organization": 1 });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "isActive": 1 });

db.organizations.createIndex({ "owner": 1 });
db.organizations.createIndex({ "name": 1 });
db.organizations.createIndex({ "isActive": 1 });

db.properties.createIndex({ "organization": 1 });
db.properties.createIndex({ "owner": 1 });
db.properties.createIndex({ "type": 1 });
db.properties.createIndex({ "address.city": 1, "address.state": 1 });

db.tenants.createIndex({ "organization": 1 });
db.tenants.createIndex({ "property": 1 });
db.tenants.createIndex({ "email": 1 });
db.tenants.createIndex({ "status": 1 });

db.payments.createIndex({ "organization": 1 });
db.payments.createIndex({ "tenant": 1 });
db.payments.createIndex({ "property": 1 });
db.payments.createIndex({ "status": 1 });
db.payments.createIndex({ "dueDate": 1 });

print('Database initialized successfully!');