const Folder = require('../models/Folder');
const Note = require('../models/Note');

const getAllFolders = async (req, res) => {
  try {
    const { search = '' } = req.query;
    const userId = req.user.id;

    const whereClause = { userId };
    
    if (search) {
      whereClause.name = { $regex: search, $options: 'i' };
    }

    const folders = await Folder.find(whereClause)
      .sort({ createdAt: -1 })
      .lean();

    // Get note counts for each folder
    const foldersWithCounts = await Promise.all(
      folders.map(async (folder) => {
        const noteCount = await Note.countDocuments({ folderId: folder._id, userId });
        return { ...folder, noteCount };
      })
    );

    res.json({ success: true, folders: foldersWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch folders' });
  }
};

const createFolder = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    let folderName = name;
    if (!folderName || folderName.trim() === '') {
      const existingFolders = await Folder.find({
        userId,
        name: { $regex: /^New Folder( \d+)?$/ }
      }).select('name');
      
      if (existingFolders.length === 0) {
        folderName = 'New Folder';
      } else {
        const numbers = existingFolders
          .map(folder => {
            if (folder.name === 'New Folder') return 0;
            const match = folder.name.match(/^New Folder (\d+)$/);
            return match ? parseInt(match[1]) : -1;
          })
          .filter(num => num >= 0)
          .sort((a, b) => a - b);
        
        let nextNumber = 2;
        for (const num of numbers) {
          if (num === 0) continue;
          if (num === nextNumber) {
            nextNumber++;
          } else {
            break;
          }
        }
        
        folderName = `New Folder ${nextNumber}`;
      }
    } else {
      // Check for duplicate folder names
      const existingFolder = await Folder.findOne({ userId, name: folderName.trim() });
      if (existingFolder) {
        return res.status(400).json({ 
          success: false, 
          message: 'A folder with this name already exists. Please choose a different name.' 
        });
      }
    }

    const folder = new Folder({
      name: folderName.trim(),
      userId
    });

    await folder.save();

    const folderWithCount = {
      ...folder.toObject(),
      noteCount: 0
    };

    res.status(201).json({ success: true, folder: folderWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create folder' });
  }
};

const updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Folder name is required' });
    }

    // Check for duplicate folder names
    const existingFolder = await Folder.findOne({ 
      userId, 
      name: name.trim(), 
      _id: { $ne: id } 
    });
    if (existingFolder) {
      return res.status(400).json({ 
        success: false, 
        message: 'A folder with this name already exists. Please choose a different name.' 
      });
    }

    const folder = await Folder.findOneAndUpdate(
      { _id: id, userId },
      { name: name.trim() },
      { new: true }
    );

    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    const noteCount = await Note.countDocuments({ folderId: id, userId });
    const folderWithCount = {
      ...folder.toObject(),
      noteCount
    };

    res.json({ success: true, folder: folderWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update folder' });
  }
};

const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const folder = await Folder.findOne({ _id: id, userId });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    // Delete all notes in the folder
    await Note.deleteMany({ folderId: id, userId });

    // Delete the folder
    await Folder.findOneAndDelete({ _id: id, userId });

    res.json({ success: true, message: 'Folder and all its notes deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete folder' });
  }
};

module.exports = {
  getAllFolders,
  createFolder,
  updateFolder,
  deleteFolder
};