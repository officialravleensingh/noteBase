const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');
const Note = require('../models/Note');
const SharedNote = require('../models/SharedNote');

const generatePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const note = await Note.findOne({ _id: id, userId }).populate('folderId', 'name');

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; line-height: 1.6; }
            h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
            .meta { color: #666; font-size: 14px; margin-bottom: 30px; }
            .content { font-size: 16px; }
            ul, ol { margin: 16px 0; padding-left: 24px; }
            li { margin: 4px 0; }
            .arrow-list { list-style: none; }
            .arrow-list li:before { content: '→ '; color: #666; }
            table { border-collapse: collapse; width: 100%; margin: 16px 0; }
            td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>${note.title}</h1>
          <div class="meta">
            ${note.folderId ? `Folder: ${note.folderId.name} | ` : ''}
            Created: ${new Date(note.createdAt).toLocaleDateString()}
          </div>
          <div class="content">${note.content}</div>
        </body>
      </html>
    `;

    await page.setContent(htmlContent);
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${note.title}.pdf"`);
    res.send(pdf);

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
};

const generateShareableLink = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const note = await Note.findOne({ _id: id, userId });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const shareId = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const sharedNote = new SharedNote({
      _id: shareId,
      noteId: id,
      userId,
      expiresAt
    });
    
    await sharedNote.save();

    const shareUrl = `${process.env.FRONTEND_URL}/shared/${shareId}`;
    
    res.json({ shareUrl, expiresAt });

  } catch (error) {
    console.error('Share link generation error:', error);
    res.status(500).json({ error: 'Failed to generate share link' });
  }
};

const getSharedNote = async (req, res) => {
  try {
    const { shareId } = req.params;

    const sharedNote = await SharedNote.findById(shareId)
      .populate({
        path: 'noteId',
        populate: [
          { path: 'folderId', select: 'name' },
          { path: 'userId', select: 'name' }
        ]
      });

    if (!sharedNote || sharedNote.expiresAt < new Date()) {
      return res.status(404).json({ error: 'Shared note not found or expired' });
    }

    res.json({ note: sharedNote.noteId });

  } catch (error) {
    console.error('Shared note fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch shared note' });
  }
};

module.exports = {
  generatePDF,
  generateShareableLink,
  getSharedNote
};