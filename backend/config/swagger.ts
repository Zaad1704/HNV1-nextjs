import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HNV1 Property Management API',
      version: '1.0.0',
      description: 'Complete API documentation for HNV1 Property Management System',
      contact: {
        name: 'HNV1 Support',
        email: 'support@hnvpm.com'
      }
    },
    servers: [
      {
        url: process.env.BACKEND_URL || 'http://localhost:5001',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./routes/*.ts', './controllers/*.ts']
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };