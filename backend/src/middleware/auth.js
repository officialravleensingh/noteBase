const { verifyToken, generateTokenPair } = require('../utils/jwt');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Access denied. No authorization header provided.' });
    }
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Invalid authorization format. Use Bearer token.' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token || token.trim() === '') {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (tokenError) {
      if (tokenError.name === 'TokenExpiredError') {
        return handleTokenRefresh(req, res, next);
      }
      console.error('Token verification error:', tokenError.message);
      return res.status(401).json({ error: 'Invalid token format.' });
    }
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Invalid token payload.' });
    }

    let user;
    try {
      user = await User.findById(decoded.userId).select('_id email name');
    } catch (dbError) {
      console.error('Database error in auth middleware:', dbError);
      return res.status(500).json({ error: 'Database error during authentication.' });
    }

    if (!user) {
      return res.status(401).json({ error: 'User not found. Token may be invalid.' });
    }

    req.user = { id: user._id, email: user.email, name: user.name };
    next();
  } catch (error) {
    console.error('Unexpected error in auth middleware:', error);
    res.status(500).json({ error: 'Internal authentication error.' });
  }
};

const handleTokenRefresh = async (req, res, next) => {
  try {
    const refreshToken = req.header('x-refresh-token');
    if (!refreshToken || refreshToken.trim() === '') {
      return res.status(401).json({ error: 'Access token expired. No refresh token provided.' });
    }

    let decoded;
    try {
      decoded = verifyToken(refreshToken);
    } catch (refreshError) {
      console.error('Refresh token verification error:', refreshError.message);
      return res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Invalid refresh token payload.' });
    }

    let user;
    try {
      user = await User.findById(decoded.userId).select('_id email name');
    } catch (dbError) {
      console.error('Database error during token refresh:', dbError);
      return res.status(500).json({ error: 'Database error during token refresh.' });
    }
    if (!user) {
      return res.status(401).json({ error: 'User not found. Refresh token may be invalid.' });
    }

    let tokens;
    try {
      tokens = generateTokenPair(user._id);
    } catch (tokenGenError) {
      console.error('Token generation error:', tokenGenError);
      return res.status(500).json({ error: 'Failed to generate new tokens.' });
    }
    
    res.set('x-access-token', tokens.accessToken);
    res.set('x-refresh-token', tokens.refreshToken);
    
    req.user = { id: user._id, email: user.email, name: user.name };
    next();
  } catch (error) {
    console.error('Unexpected error in token refresh:', error);
    res.status(500).json({ error: 'Internal error during token refresh.' });
  }
};

module.exports = { authenticate };