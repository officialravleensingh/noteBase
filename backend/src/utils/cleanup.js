const User = require('../models/User');
const Note = require('../models/Note');
const Folder = require('../models/Folder');
const SectionPin = require('../models/SectionPin');
const OTP = require('../models/OTP');

const cleanupExpiredAccounts = async () => {
  try {
    // Find users scheduled for deletion
    const usersToDelete = await User.find({
      deletionScheduledAt: { $lt: new Date() }
    });

    if (usersToDelete.length === 0) {
      return { deletedCount: 0 };
    }

    const userIds = usersToDelete.map(user => user._id);
    const emails = usersToDelete.map(user => user.email);

    // Delete all related data
    await Promise.all([
      Note.deleteMany({ userId: { $in: userIds } }),
      Folder.deleteMany({ userId: { $in: userIds } }),
      SectionPin.deleteMany({ userId: { $in: userIds } }),
      OTP.deleteMany({ email: { $in: emails } })
    ]);

    // Delete users
    const result = await User.deleteMany({
      deletionScheduledAt: { $lt: new Date() }
    });

    console.log(`Cleaned up ${result.deletedCount} expired accounts and their data`);
    return result;
  } catch (error) {
    console.error('Cleanup error:', error);
    throw error;
  }
};

const cancelAccountDeletion = async (userId) => {
  try {
    await User.findByIdAndUpdate(userId, {
      $unset: { deletionScheduledAt: 1 }
    });
  } catch (error) {
    console.error('Cancel deletion error:', error);
    throw error;
  }
};

module.exports = {
  cleanupExpiredAccounts,
  cancelAccountDeletion
};