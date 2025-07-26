import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User';

export const setupPassport = (): void => {
  // JWT Strategy
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET || 'fallback-secret',
      },
      async (payload, done) => {
        try {
          const user = await User.findById(payload.id)
            .populate('organization')
            .select('-password');
          
          if (user) {
            return done(null, user);
          }
          return done(null, false);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user already exists with this Google ID
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
              return done(null, user);
            }

            // Check if user exists with the same email
            user = await User.findOne({ email: profile.emails?.[0]?.value });

            if (user) {
              // Link Google account to existing user
              user.googleId = profile.id;
              user.avatar = profile.photos?.[0]?.value || user.avatar;
              await user.save();
              return done(null, user);
            }

            // Create new user
            const newUser = new User({
              googleId: profile.id,
              firstName: profile.name?.givenName || '',
              lastName: profile.name?.familyName || '',
              email: profile.emails?.[0]?.value || '',
              avatar: profile.photos?.[0]?.value || '',
              isEmailVerified: true, // Google emails are pre-verified
              authProvider: 'google',
              role: 'user', // Default role
            });

            await newUser.save();
            return done(null, newUser);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
  }

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user._id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id)
        .populate('organization')
        .select('-password');
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};