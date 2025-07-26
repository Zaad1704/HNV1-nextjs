import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import User from '../models/User';

const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'fallback-secret'
};

passport.use(new JwtStrategy(jwtOptions, async (payload: any, done: (error: any, user?: any) => void) => {
  try {
    const user = await User.findById(payload.id);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Google OAuth Strategy
const callbackURL = process.env.NODE_ENV === 'production'
  ? `${process.env.BACKEND_URL}/api/auth/google/callback`
  : 'http://localhost:5001/api/auth/google/callback';

if (process.env.GOOGLE_CLIENT_ID && 
    process.env.GOOGLE_CLIENT_SECRET && 
    process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here' &&
    process.env.GOOGLE_CLIENT_SECRET !== 'your_google_client_secret_here') {
  
  console.log('✅ Google OAuth configured successfully');
  
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL
  }, async (accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any) => void) => {
    try {
      console.log('Google OAuth callback received for:', profile.emails?.[0]?.value);
      
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        console.log('Existing Google user found:', user.email);
        return done(null, user);
      }
      
      // Check if user exists with same email
      const existingUser = await User.findOne({ email: profile.emails?.[0]?.value });
      if (existingUser) {
        // Link Google account to existing user
        existingUser.googleId = profile.id;
        existingUser.profilePicture = profile.photos?.[0]?.value;
        existingUser.isEmailVerified = true;
        existingUser.status = 'Active';
        await existingUser.save();
        console.log('Linked Google account to existing user:', existingUser.email);
        return done(null, existingUser);
      }
      
      // Prevent account creation during login - return error
      console.log('❌ Google login attempted for non-existing user:', profile.emails?.[0]?.value);
      return done(new Error('ACCOUNT_NOT_FOUND'), false);
    } catch (error) {
      console.error('Google OAuth error:', error);
      done(error, false);
    }
  }));
} else {
  console.warn('❌ Google OAuth not configured - missing or placeholder GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET');
}

passport.serializeUser((user: any, done: (err: any, id?: any) => void) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done: (err: any, user?: any) => void) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;