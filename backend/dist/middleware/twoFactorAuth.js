"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.twoFactorAuth = void 0;
const twoFactorAuth = (req, res, next) => {
    try {
        next();
    }
    catch (error) {
        console.error('Two factor auth error:', error);
        next();
    }
};
exports.twoFactorAuth = twoFactorAuth;
exports.default = exports.twoFactorAuth;
