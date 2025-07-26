"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 5001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'HNV1 Backend is running',
        timestamp: new Date().toISOString()
    });
});
app.get('/api-docs', (req, res) => {
    res.json({
        message: 'API Documentation - Coming soon',
        endpoints: [
            'GET /health - Health check',
            'POST /api/auth/register - User registration',
            'POST /api/auth/login - User login'
        ]
    });
});
app.post('/api/auth/register', (req, res) => {
    res.json({
        success: true,
        message: 'Registration endpoint ready - Database connection needed',
        data: null
    });
});
app.post('/api/auth/login', (req, res) => {
    res.json({
        success: true,
        message: 'Login endpoint ready - Database connection needed',
        data: null
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});
