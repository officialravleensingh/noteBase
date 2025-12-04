const { verifyToken, generateTokenPair } = require('../utils/jwt');
const { prisma } = require('../db/database');

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = verifyToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true }
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user.id);

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