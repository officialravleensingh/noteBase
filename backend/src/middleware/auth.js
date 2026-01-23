const { verifyToken, generateTokenPair } = require('../utils/jwt');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. Invalid authorization format.' });
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
      return res.status(401).json({ error: 'Invalid token.' });
    }
    
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Invalid token payload.' });
    }

    const user = await User.findById(decoded.userId).select('_id email name');
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    req.user = { id: user._id, email: user.email, name: user.name };
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication error.' });
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
      decoded = verifyToken(refreshToken, true);
    } catch (refreshError) {
      return res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }
    
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Invalid refresh token payload.' });
    }

    const user = await User.findById(decoded.userId).select('_id email name');
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    const tokens = generateTokenPair(user._id);
    
    res.set('x-access-token', tokens.accessToken);
    res.set('x-refresh-token', tokens.refreshToken);
    
    req.user = { id: user._id, email: user.email, name: user.name };
    next();
  } catch (error) {
    res.status(500).json({ error: 'Token refresh error.' });
  }
};

module.exports = { authenticate };