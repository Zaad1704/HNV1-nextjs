import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HNV1 NextJS Property Management API',
      version: '1.0.0',
      description: 'A comprehensive property management system API built with Express.js and MongoDB',
      contact: {
        name: 'HNV1 Team',
        email: 'support@hnv1.com',
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://api.hnv1.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['user', 'admin', 'super_admin'] },
            organization: { type: 'string' },
            isEmailVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Property: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            address: { type: 'string' },
            type: { type: 'string', enum: ['apartment', 'house', 'commercial', 'other'] },
            units: { type: 'array', items: { $ref: '#/components/schemas/Unit' } },
            owner: { type: 'string' },
            organization: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Unit: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            unitNumber: { type: 'string' },
            rent: { type: 'number' },
            deposit: { type: 'number' },
            status: { type: 'string', enum: ['vacant', 'occupied', 'maintenance'] },
            tenant: { type: 'string' },
            property: { type: 'string' },
          },
        },
        Tenant: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            unit: { type: 'string' },
            property: { type: 'string' },
            leaseStart: { type: 'string', format: 'date' },
            leaseEnd: { type: 'string', format: 'date' },
            rentAmount: { type: 'number' },
            depositAmount: { type: 'number' },
            status: { type: 'string', enum: ['active', 'inactive', 'pending'] },
            organization: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            tenant: { type: 'string' },
            property: { type: 'string' },
            unit: { type: 'string' },
            amount: { type: 'number' },
            type: { type: 'string', enum: ['rent', 'deposit', 'fee', 'other'] },
            method: { type: 'string', enum: ['cash', 'check', 'bank_transfer', 'card', 'online'] },
            status: { type: 'string', enum: ['pending', 'completed', 'failed', 'refunded'] },
            dueDate: { type: 'string', format: 'date' },
            paidDate: { type: 'string', format: 'date' },
            organization: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: { type: 'string' },
            statusCode: { type: 'number' },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './routes/*.ts',
    './controllers/*.ts',
    './models/*.ts',
  ],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'HNV1 API Documentation',
  }));

  // JSON endpoint for the swagger spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};