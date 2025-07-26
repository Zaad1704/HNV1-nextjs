"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const User_1 = __importDefault(require("../models/User"));
const jwtOptions = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'fallback-secret'
};
passport_1.default.use(new passport_jwt_1.Strategy(jwtOptions, async (payload, done) => {
    try {
        const user = await User_1.default.findById(payload.id);
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    }
    catch (error) {
        return done(error, false);
    }
}));
const callbackURL = process.env.NODE_ENV === 'production'
    ? `${process.env.BACKEND_URL}/api/auth/google/callback`
    : 'http://localhost:5001/api/auth/google/callback';
if (process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here' &&
    process.env.GOOGLE_CLIENT_SECRET !== 'your_google_client_secret_here') {
    console.log('✅ Google OAuth configured successfully');
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: callbackURL
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log('Google OAuth callback received for:', profile.emails?.[0]?.value);
            let user = await User_1.default.findOne({ googleId: profile.id });
            if (user) {
                console.log('Existing Google user found:', user.email);
                return done(null, user);
            }
            const existingUser = await User_1.default.findOne({ email: profile.emails?.[0]?.value });
            if (existingUser) {
                existingUser.googleId = profile.id;
                existingUser.profilePicture = profile.photos?.[0]?.value;
                existingUser.isEmailVerified = true;
                existingUser.status = 'Active';
                await existingUser.save();
                console.log('Linked Google account to existing user:', existingUser.email);
                return done(null, existingUser);
            }
            console.log('❌ Google login attempted for non-existing user:', profile.emails?.[0]?.value);
            return done(new Error('ACCOUNT_NOT_FOUND'), false);
        }
        catch (error) {
            console.error('Google OAuth error:', error);
            done(error, false);
        }
    }));
}
else {
    console.warn('❌ Google OAuth not configured - missing or placeholder GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET');
}
passport_1.default.serializeUser((user, done) => {
    done(null, user._id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await User_1.default.findById(id);
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
});
exports.default = passport_1.default;
