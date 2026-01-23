const SectionPin = require('../models/SectionPin');
const bcrypt = require('bcryptjs');

// Set PIN for a section
const setPin = async (req, res) => {
  try {
    const { section, pin } = req.body;
    const userId = req.user.id;

    // Validate section
    if (!['memories', 'journal'].includes(section)) {
      return res.status(400).json({ message: 'Invalid section' });
    }

    // Validate PIN format (4 digits)
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ message: 'PIN must be exactly 4 digits' });
    }

    // Hash the PIN
    const pinHash = await bcrypt.hash(pin, 12);

    // Create or update PIN
    await SectionPin.findOneAndUpdate(
      { userId, section },
      { pinHash },
      { upsert: true, new: true }
    );

    res.json({ message: `${section} PIN set successfully` });
  } catch (error) {
    console.error('Set PIN error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify PIN for section access
const verifyPin = async (req, res) => {
  try {
    const { section, pin } = req.body;
    const userId = req.user.id;

    // Validate section
    if (!['memories', 'journal'].includes(section)) {
      return res.status(400).json({ message: 'Invalid section' });
    }

    // Validate PIN format
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ message: 'PIN must be exactly 4 digits' });
    }

    // Find PIN record
    const sectionPin = await SectionPin.findOne({ userId, section });
    if (!sectionPin) {
      return res.status(404).json({ message: 'No PIN set for this section' });
    }

    // Verify PIN
    const isValid = await bcrypt.compare(pin, sectionPin.pinHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid PIN' });
    }

    res.json({ message: 'PIN verified successfully', verified: true });
  } catch (error) {
    console.error('Verify PIN error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if PIN exists for section
const checkPin = async (req, res) => {
  try {
    const { section } = req.params;
    const userId = req.user.id;

    // Validate section
    if (!['memories', 'journal'].includes(section)) {
      return res.status(400).json({ message: 'Invalid section' });
    }

    // Check if PIN exists
    const sectionPin = await SectionPin.findOne({ userId, section });
    
    res.json({ 
      hasPin: !!sectionPin,
      section 
    });
  } catch (error) {
    console.error('Check PIN error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove PIN for section
const removePin = async (req, res) => {
  try {
    const { section } = req.body;
    const userId = req.user.id;

    // Validate section
    if (!['memories', 'journal'].includes(section)) {
      return res.status(400).json({ message: 'Invalid section' });
    }

    // Remove PIN
    await SectionPin.findOneAndDelete({ userId, section });

    res.json({ message: `${section} PIN removed successfully` });
  } catch (error) {
    console.error('Remove PIN error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  setPin,
  verifyPin,
  checkPin,
  removePin
};