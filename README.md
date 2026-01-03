# NoteBase - A Smart Personalised Notes Management Application

A complete full-stack note management system designed for a modern, personalized note-taking experience with AI integration, collaboration features, and intelligent assistance.

## Problem Statement

Managing and organizing notes across devices often becomes cluttered, and most apps lack personalization, collaboration, and intelligent assistance. **NoteBase** aims to solve this by providing a secure, customizable, and AI-powered note management system where users can create, organize, and share notes, collaborate in shared spaces, and use AI tools for summarization and grammar correction.

## System Architecture

```
Frontend → Backend (API) → Database → AI Integration (API)
```

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: TailwindCSS with PostCSS
- **State Management**: React Hooks (useState, useEffect)
- **Rich Text Editor**: ContentEditable with custom toolbar
- **HTTP Client**: Fetch API with custom wrapper

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database ODM**: Mongoose
- **Authentication**: JWT with refresh tokens + bcrypt
- **OAuth**: Google OAuth 2.0
- **Email Service**: Nodemailer (Gmail SMTP)
- **PDF Generation**: Puppeteer
- **Validation**: Express Validator
- **Security**: CORS, Security Headers, Rate Limiting

### Database
- **Database**: MongoDB Atlas
- **Schema**: Mongoose Schema with relations
- **Models**: User, Note, Folder, SharedNote, OTP
- **Indexing**: Optimized queries with database indexes

### DevOps & Deployment
- **Frontend Hosting**: Vercel (configured)
- **Backend Hosting**: Render (configured)
- **Database**: MongoDB Atlas
- **Environment**: Development and Production configs
- **Version Control**: Git with .gitignore for sensitive files

## API Endpoints

### Authentication Routes
| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/auth/signup` | POST | Register new user | Public |
| `/api/auth/verify-email` | POST | Verify email with OTP | Public |
| `/api/auth/login` | POST | User login | Public |
| `/api/auth/forgot-password` | POST | Request password reset | Public |
| `/api/auth/reset-password` | POST | Reset password with OTP | Public |
| `/api/auth/resend-otp` | POST | Resend OTP code | Public |
| `/api/auth/refresh` | POST | Refresh access token | Public |
| `/api/auth/logout` | POST | User logout | Public |
| `/api/auth/profile` | GET | Get user profile | Authenticated |
| `/api/auth/google` | GET | Initiate Google OAuth | Public |
| `/api/auth/google/callback` | GET | Handle OAuth callback | Public |

### Notes Management
| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/notes` | GET | Fetch all notes (with search, filter, sort, pagination) | Authenticated |
| `/api/notes` | POST | Create new note | Authenticated |
| `/api/notes/:id` | GET | Get specific note by ID | Authenticated |
| `/api/notes/:id` | PUT | Update note | Authenticated |
| `/api/notes/:id` | DELETE | Delete note | Authenticated |

### Folders Management
| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/folders` | GET | Fetch all folders | Authenticated |
| `/api/folders` | POST | Create new folder | Authenticated |
| `/api/folders/:id` | PUT | Update folder | Authenticated |
| `/api/folders/:id` | DELETE | Delete folder | Authenticated |

### Export & Sharing
| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/export/notes/:id/pdf` | GET | Generate PDF export | Authenticated |
| `/api/export/notes/:id/share` | POST | Create shareable link | Authenticated |
| `/api/export/shared/:shareId` | GET | Access shared note | Public |

### System
| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/health` | GET | API health check | Public |

## Key Features

### 🔐 Authentication & Security
- JWT-based authentication with refresh tokens
- Google OAuth 2.0 integration for seamless sign-in
- Email verification with OTP during signup
- Password reset functionality with OTP verification
- Remember me feature (localStorage vs sessionStorage)
- Automatic token refresh for enhanced security
- Secure password hashing with bcrypt
- Rate limiting to prevent abuse
- CORS and security headers protection

### 📝 Note Management
- Create, Read, Update, Delete notes and folders
- Three note types: Normal (📝), Journal (📔), Memory (💭)
- Rich text editor with minimized toolbar
- Real-time content editing with auto-save
- Word count tracking
- Unsaved changes detection and warnings
- Note organization within folders
- Duplicate title prevention

### 🎨 Rich Text Editing
- **Minimized Toolbar**: Aa dropdown with formatting options
- **Text Formatting**: Bold, italic, underline, strikethrough
- **Text Sizes**: Title, Heading 1-3, Normal, Small
- **Text Alignment**: Left, center, right alignment
- **Lists**: Bullet points, numbered lists, arrow lists
- **Advanced Features**: Code blocks, superscript, subscript
- **Media**: Image upload and insertion
- **Utilities**: Find and replace, text color customization
- **Keyboard Shortcuts**: Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+F

### 🔍 Search & Organization
- Global search across notes and folders by title/content
- Advanced sorting (date created/updated, title A-Z/Z-A)
- Folder-based organization system
- Pagination for optimal performance
- Bulk operations (select and delete multiple items)
- Responsive design with mobile-friendly interface

### 📤 Export & Sharing
- **PDF Export**: Generate and download notes as PDF
- **Shareable Links**: Create time-limited public links
- **Public Access**: View shared notes without authentication
- **Export Modal**: User-friendly export interface

### 🎯 User Experience
- Responsive design with TailwindCSS
- User dropdown with Profile/Settings/Logout
- Modal-based workflows for creating notes/folders
- Real-time feedback and loading states
- Clean, modern interface design
- Split-view editor (hidden on mobile)
- Note type indicators with emojis

## Project Structure

```
noteBase/
├── frontend/                 # Next.js 14 application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   │   ├── auth/        # Authentication pages
│   │   │   ├── dashboard/   # Main dashboard
│   │   │   ├── editor/      # Note editor pages
│   │   │   ├── login/       # Login page
│   │   │   ├── signup/      # Signup page
│   │   │   └── shared/      # Shared notes access
│   │   ├── components/      # Reusable UI components
│   │   │   ├── AuthForm.js
│   │   │   ├── Dashboard.js
│   │   │   ├── NoteEditor.js
│   │   │   ├── NoteCard.js
│   │   │   ├── FolderCard.js
│   │   │   ├── CreateNoteModal.js
│   │   │   ├── CreateFolderModal.js
│   │   │   ├── ExportModal.js
│   │   │   └── GoogleAuthButton.js
│   │   ├── hooks/           # Custom React hooks
│   │   │   └── useAuth.js
│   │   └── lib/             # API handlers, utilities
│   │       └── api.js
│   ├── public/              # Static assets
│   ├── .env.local           # Environment variables
│   ├── next.config.js       # Next.js configuration
│   ├── tailwind.config.js   # TailwindCSS configuration
│   └── package.json
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   │   ├── authController.js
│   │   │   ├── notesController.js
│   │   │   ├── foldersController.js
│   │   │   ├── exportController.js
│   │   │   ├── oauthController.js
│   │   │   ├── profileController.js
│   │   │   ├── tokenController.js
│   │   │   └── logoutController.js
│   │   ├── routes/          # API route definitions
│   │   │   ├── authRoutes.js
│   │   │   ├── notes.js
│   │   │   ├── folders.js
│   │   │   ├── export.js
│   │   │   └── oauthRoutes.js
│   │   ├── middleware/      # Auth, validation, error handling
│   │   │   ├── auth.js
│   │   │   ├── validation.js
│   │   │   ├── errorHandler.js
│   │   │   └── dataProtection.js
│   │   ├── utils/           # JWT, bcrypt, helpers
│   │   │   ├── jwt.js
│   │   │   ├── bcrypt.js
│   │   │   └── encryption.js
│   │   ├── db/              # Database connection
│   │   │   └── database.js
│   │   └── app.js           # Express app configuration
│   ├── prisma/              # Database schema and migrations
│   │   └── schema.prisma
│   ├── .env                 # Environment variables
│   ├── server.js            # Server entry point
│   └── package.json
└── README.md
```

## Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Git

### Backend Setup
```bash
cd backend
npm install
npm run dev  # Runs on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:3000
```

### Available Scripts

#### Backend Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

#### Frontend Scripts
- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm start` - Start production server

### Environment Configuration

The application requires environment variables for:
- Database connection (MongoDB Atlas)
- JWT authentication secrets
- Google OAuth credentials
- Email service configuration (Gmail SMTP)
- API endpoints
- Server configuration

Refer to `.env.example` files in both frontend and backend directories for required variables.

### Phase 1: ✅ Authentication System (Completed)
- JWT-based login/signup with refresh tokens
- Google OAuth 2.0 integration
- Email verification with OTP during signup
- Password reset functionality with OTP
- Remember me feature with localStorage/sessionStorage
- Protected routes and middleware
- User management and profile system
- Database integration with Mongoose
- Secure password hashing with bcrypt
- Rate limiting and security headers

### Phase 2: ✅ Notes CRUD Operations (Completed)
- Create, read, update, delete notes
- Three note types: Normal, Journal, Memory
- Rich text editor with minimized toolbar
- Real-time content editing
- Word count tracking
- Auto-save functionality
- Unsaved changes detection
- Duplicate title prevention

### Phase 3: ✅ Advanced Features (Completed)
- Search functionality across notes and folders
- Sort by date, title (ascending/descending)
- Pagination for large datasets
- Folder management system
- Bulk operations (select and delete multiple items)
- Responsive design with mobile support

### Phase 4: ✅ Export & Sharing (Completed)
- PDF export functionality
- Shareable links with expiration
- Public access to shared notes
- Export modal with options

### Phase 5: ✅ Enhanced UI/UX (Completed)
- User dropdown with Profile/Settings/Logout
- Minimized toolbar with Aa dropdown
- Note type indicators with emojis
- Responsive editor (hidden on mobile)
- Centered toolbar layout
- Modern interface design

### Phase 6: 📋 Upcoming Features
- AI Integration (text summarization, grammar correction)
- Theme customization (dark/light mode)
- Collaborative editing
- Real-time synchronization
- Advanced note security features

## Deployment
- **Frontend**: Vercel with environment variables configured
- **Backend**: Render with OAuth credentials and database URL
- **Database**: MongoDB Atlas
- **OAuth**: Google Cloud Console configuration
- **Security**: CORS and security headers enabled

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.

---

**NoteBase** combines advanced features and personalization to deliver a seamless experience similar to Apple Notes, with additional collaborative and AI-driven functionalities for modern note management.