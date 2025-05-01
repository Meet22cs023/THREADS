import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initiate Google OAuth login
router.get('/google', (req, res, next) => {
  console.log("Starting Google OAuth flow");
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
});

// Google OAuth callback
router.get('/google/callback', 
  (req, res, next) => {
    console.log("Received callback from Google OAuth");
    passport.authenticate('google', { 
      failureRedirect: `${process.env.FRONTEND_URL}/auth?error=Failed to login with Google`,
      session: false 
    })(req, res, next);
  },
  (req, res) => {
    try {
      console.log("Google authentication successful, creating token");
      
      // Create JWT token
      const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: '15d',
      });

      // Set cookie
      res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
        sameSite: 'strict',
      });

      // Prepare user data to send
      const userData = {
        _id: req.user._id,
        name: req.user.name,
        username: req.user.username,
        email: req.user.email,
        profilePic: req.user.profilePic,
        bio: req.user.bio,
      };

      console.log("Redirecting to frontend with user data");
      
      // Redirect to frontend root path with user data (instead of /auth)
      const userDataStr = encodeURIComponent(JSON.stringify(userData));
      res.redirect(`${process.env.FRONTEND_URL}/?authSuccess=true&userData=${userDataStr}`);
    } catch (error) {
      console.error('Error in Google callback:', error);
      res.redirect(`${process.env.FRONTEND_URL}/auth?error=Server error`);
    }
  }
);

// Debug route to verify Google credentials
router.get('/debug', (req, res) => {
  res.json({
    clientID: process.env.GOOGLE_CLIENT_ID ? "✓ Set" : "✗ Missing",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ? "✓ Set" : "✗ Missing",
    frontendURL: process.env.FRONTEND_URL,
    backendURL: process.env.BACKEND_URL,
    callbackURL: `${process.env.FRONTEND_URL}/api/auth/google/callback`
  });
});

export default router; 