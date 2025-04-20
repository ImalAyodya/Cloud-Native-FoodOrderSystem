// backend/passportConfig.js
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
        user = new User({ 
            name: profile.displayName, 
            email: profile.emails[0].value, 
            googleId: profile.id, 
            isVerified: true 
        });
        await user.save();
    }
    
    return done(null, user);
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
});

module.exports = passport;
