const User = require('../models/User');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile retrieved successfully', 
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        religion: user.religion,
        dob: user.dob,
        address: user.address,
        pincode: user.pincode,
        city: user.city,
        state: user.state,
        country: user.country,
        mobile: user.mobile,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

module.exports = { getProfile };