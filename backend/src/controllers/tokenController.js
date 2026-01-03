const { verifyToken, generateTokenPair } = require('../utils/jwt');
const User = require('../models/User');

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = verifyToken(refreshToken);
    const user = await User.findById(decoded.userId).select('email name');
    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user._id);

    res.json({
      message: 'Tokens refreshed successfully',
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

module.exports = { refreshToken };