"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orgContext = void 0;
const orgContext = (req, res, next) => {
    try {
        const user = req.user;
        if (user && user.organizationId) {
            req.organizationId = user.organizationId;
        }
        next();
    }
    catch (error) {
        console.error('Organization context error:', error);
        next();
    }
};
exports.orgContext = orgContext;
exports.default = exports.orgContext;
