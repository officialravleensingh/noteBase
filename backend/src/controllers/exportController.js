const Note = require('../models/Note');
const puppeteer = require('puppeteer');

const exportToPDF = async (req, res) => {
  let browser;
  try {
    const { id } = req.params;
    
    const note = await Note.findOne({ _id: id, userId: req.user.id });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${note.title || 'Untitled'}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 40px; 
              line-height: 1.6; 
              color: #333;
            }
            h1 { 
              color: #333; 
              border-bottom: 2px solid #eee; 
              padding-bottom: 10px; 
              margin-bottom: 20px;
            }
            .meta { 
              color: #666; 
              font-size: 14px; 
              margin-bottom: 30px; 
              padding: 10px;
              background: #f9f9f9;
              border-radius: 5px;
            }
            .content { 
              margin-top: 20px; 
              font-size: 14px;
            }
            .content img {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          <h1>${note.title || 'Untitled'}</h1>
          <div class="meta">
            <p><strong>Created:</strong> ${new Date(note.createdAt).toLocaleDateString()}</p>
            <p><strong>Updated:</strong> ${new Date(note.updatedAt).toLocaleDateString()}</p>
          </div>
          <div class="content">${note.content || '<p>No content</p>'}</div>
        </body>
      </html>
    `;
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1in', bottom: '1in', left: '1in', right: '1in' }
    });
    
    const filename = `${(note.title || 'note').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdf.length);
    res.send(pdf);
    
  } catch (error) {
    console.error('PDF Export Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  } finally {
    if (browser) {
      await browser.close().catch(console.error);
    }
  }
};

module.exports = {
  exportToPDF
};