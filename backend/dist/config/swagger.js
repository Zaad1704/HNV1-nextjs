"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.specs = exports.swaggerUi = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
exports.swaggerUi = swagger_ui_express_1.default;
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
const specs = (0, swagger_jsdoc_1.default)(options);
exports.specs = specs;
