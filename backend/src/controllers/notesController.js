const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllNotes = async (req, res) => {
  try {
    const { 
      sortBy = 'updatedAt', 
      order = 'desc', 
      folderId, 
      noFolder, 
      page = 1, 
      limit = 10, 
      search = '' 
    } = req.query;
    const userId = req.user.id;

    // Input validation
    const validSortFields = ['updatedAt', 'createdAt', 'title'];
    const validOrders = ['asc', 'desc'];
    
    if (!validSortFields.includes(sortBy)) {
      return res.status(400).json({ success: false, message: 'Invalid sort field' });
    }
    
    if (!validOrders.includes(order)) {
      return res.status(400).json({ success: false, message: 'Invalid sort order' });
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10)); // Max 100 items per page

    const whereClause = { userId };
    
    if (folderId) {
      whereClause.folderId = folderId;
    } else if (noFolder === 'true') {
      whereClause.folderId = null;
    }

    if (search && search.trim()) {
      const searchTerm = search.trim();
      whereClause.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { content: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }

    const skip = (pageNum - 1) * limitNum;

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          folder: {
            select: { id: true, name: true }
          }
        },
        orderBy: {
          [sortBy]: order
        },
        skip,
        take: limitNum
      }),
      prisma.note.count({ where: whereClause })
    ]);

    res.json({ 
      success: true, 
      notes, 
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notes' });
  }
};

const createNote = async (req, res) => {
  try {
    const { title, content, folderId } = req.body;
    const userId = req.user.id;

    // Input validation
    if (title && title.length > 200) {
      return res.status(400).json({ success: false, message: 'Title must be less than 200 characters' });
    }

    if (content && content.length > 50000) {
      return res.status(400).json({ success: false, message: 'Content must be less than 50,000 characters' });
    }

    // Verify folder ownership if folderId is provided
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId }
      });
      if (!folder) {
        return res.status(400).json({ success: false, message: 'Invalid folder' });
      }
    }

    let noteTitle = title?.trim();
    if (!noteTitle) {
      const existingNotes = await prisma.note.findMany({
        where: { userId, title: { startsWith: 'Untitled' } },
        select: { title: true }
      });
      
      if (existingNotes.length === 0) {
        noteTitle = 'Untitled';
      } else {
        const untitledNumbers = existingNotes
          .map(note => {
            if (note.title === 'Untitled') return 0;
            const match = note.title.match(/^Untitled (\d+)$/);
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
        
        noteTitle = `Untitled ${nextNumber}`;
      }
    } else {
      const existingNote = await prisma.note.findFirst({
        where: { 
          userId, 
          title: noteTitle
        }
      });
      
      if (existingNote) {
        return res.status(400).json({ 
          success: false, 
          message: 'A note with this title already exists. Please choose a different title.' 
        });
      }
    }

    const note = await prisma.note.create({
      data: {
        title: noteTitle,
        content: content?.trim() || '',
        userId,
        folderId: folderId || null
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        folder: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(201).json({ success: true, note });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ success: false, message: 'Failed to create note' });
  }
};

const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, folderId } = req.body;
    const userId = req.user.id;

    // Input validation
    if (!id) {
      return res.status(400).json({ success: false, message: 'Note ID is required' });
    }

    if (title && title.length > 200) {
      return res.status(400).json({ success: false, message: 'Title must be less than 200 characters' });
    }

    if (content && content.length > 50000) {
      return res.status(400).json({ success: false, message: 'Content must be less than 50,000 characters' });
    }

    // Verify folder ownership if folderId is provided
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId }
      });
      if (!folder) {
        return res.status(400).json({ success: false, message: 'Invalid folder' });
      }
    }

    // Check if note exists and belongs to user
    const existingNote = await prisma.note.findFirst({
      where: { id, userId }
    });

    if (!existingNote) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const note = await prisma.note.update({
      where: { id, userId },
      data: {
        title: title?.trim(),
        content: content?.trim(),
        folderId: folderId || null
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        folder: {
          select: { id: true, name: true }
        }
      }
    });

    res.json({ success: true, note });
  } catch (error) {
    console.error('Update note error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    res.status(500).json({ success: false, message: 'Failed to update note' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Note ID is required' });
    }

    // Check if note exists and belongs to user
    const existingNote = await prisma.note.findFirst({
      where: { id, userId }
    });

    if (!existingNote) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    await prisma.note.delete({
      where: { id, userId }
    });

    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    res.status(500).json({ success: false, message: 'Failed to delete note' });
  }
};

const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Note ID is required' });
    }

    const note = await prisma.note.findFirst({
      where: { id, userId },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        folder: {
          select: { id: true, name: true }
        }
      }
    });

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.json({ success: true, note });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch note' });
  }
};

module.exports = {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
  getNoteById
};