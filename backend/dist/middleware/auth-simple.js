"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireOrganization = exports.authMiddleware = void 0;
const authMiddleware = (req, res, next) => {
    req.user = {
        _id: 'user123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        organization: 'org123'
    };
    next();
};
exports.authMiddleware = authMiddleware;
const requireOrganization = (req, res, next) => {
    req.user = {
        _id: 'user123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        organization: 'org123'
    };
    next();
};
exports.requireOrganization = requireOrganization;
