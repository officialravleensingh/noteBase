const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllFolders = async (req, res) => {
  try {
    const { search = '' } = req.query;
    const userId = req.user.id;

    const whereClause = { userId };
    
    if (search) {
      whereClause.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const folders = await prisma.folder.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { notes: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, folders });
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
      const existingFolders = await prisma.folder.findMany({
        where: { userId, name: { startsWith: 'Untitled Folder' } },
        select: { name: true }
      });
      
      if (existingFolders.length === 0) {
        folderName = 'Untitled Folder';
      } else {
        const untitledNumbers = existingFolders
          .map(folder => {
            if (folder.name === 'Untitled Folder') return 0;
            const match = folder.name.match(/^Untitled Folder (\d+)$/);
            return match ? parseInt(match[1]) : -1;
          })
          .filter(num => num >= 0)
          .sort((a, b) => a - b);
        
        let nextNumber = 2;
        for (const num of untitledNumbers) {
          if (num === 0) continue;
          if (num === nextNumber) {
            nextNumber++;
          } else {
            break;
          }
        }
        
        folderName = `Untitled Folder ${nextNumber}`;
      }
    }

    const folder = await prisma.folder.create({
      data: {
        name: folderName.trim(),
        userId
      },
      include: {
        _count: {
          select: { notes: true }
        }
      }
    });

    res.status(201).json({ success: true, folder });
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

    const folder = await prisma.folder.update({
      where: { id, userId },
      data: { name: name.trim() },
      include: {
        _count: {
          select: { notes: true }
        }
      }
    });

    res.json({ success: true, folder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update folder' });
  }
};

const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await prisma.note.deleteMany({
      where: { folderId: id, userId }
    });

    await prisma.folder.delete({
      where: { id, userId }
    });

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