const { prisma } = require('../db/database');

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        avatar: true,
        createdAt: true,
        lastLogin: true
      }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({message: 'Profile retrieved successfully',user});
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

module.exports = { getProfile };