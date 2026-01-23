# NoteBase - Smart Personalised Notes Management Application

A complete full-stack note management system with advanced features including memories, journal entries, collaboration, and intelligent assistance.



### ✅ **Completed Features:**
- **Authentication System** - JWT + Google OAuth + Email verification
- **Notes Management** - CRUD with rich text editor and auto-save
- **Memories & Journal** - Dedicated sections with PIN protection
- **Advanced Settings** - User preferences with security controls
- **Collaboration System** - Real-time sharing with custom permissions
- **Export Features** - PDF export functionality
- **Advanced Organization** - Folders, search, sorting, recycle bin
- **Security Features** - Rate limiting, data protection, section locks
- **Responsive Design** - Mobile-friendly interface

### 🚧 **Remaining Features :**
- **Dark Mode** - Theme switching functionality
- **AI Integration** - Text summarization and grammar correction
- **Landing Page** - Marketing/welcome page
- **UI Enhancements** - Final polish and animations

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: TailwindCSS with PostCSS
- **State Management**: React Hooks
- **Rich Text Editor**: ContentEditable with custom toolbar
- **HTTP Client**: Fetch API with custom wrapper

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database ODM**: Mongoose
- **Authentication**: JWT with refresh tokens + bcrypt
- **OAuth**: Google OAuth 2.0
- **Email Service**: Nodemailer (Gmail SMTP)
- **Validation**: Express Validator
- **PDF Generation**: Puppeteer
- **Security**: CORS, Security Headers, Rate Limiting

### Database
- **Database**: MongoDB Atlas
- **Schema**: Mongoose Schema with relations
- **Models**: User, Note, Folder, Memory, JournalEntry, SharedNote, OTP, RecycleBin, UserSettings
- **Indexing**: Optimized queries with database indexes

### DevOps & Deployment
- **Frontend Hosting**: Vercel (configured)
- **Backend Hosting**: Render (configured)
- **Database**: MongoDB Atlas
- **Environment**: Development and Production configs
- **Version Control**: Git with .gitignore for sensitive files

## 📡 API Endpoints

### Authentication Routes
| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/auth/signup` | POST | Register new user | Public |
| `/api/auth/verify-email` | POST | Verify email with OTP | Public |
| `/api/auth/login` | POST | User login | Public |
| `/api/auth/forgot-password` | POST | Request password reset | Public |
| `/api/auth/reset-password` | POST | Reset password with OTP | Public |
| `/api/auth/refresh` | POST | Refresh access token | Public |
| `/api/auth/profile` | GET | Get user profile | Authenticated |
| `/api/auth/google` | GET | Initiate Google OAuth | Public |

### Notes Management
| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/notes` | GET | Fetch all notes (with search, filter, sort, pagination) | Authenticated |
| `/api/notes` | POST | Create new note | Authenticated |
| `/api/notes/:id` | GET | Get specific note by ID | Authenticated |
| `/api/notes/:id` | PUT | Update note | Authenticated |
| `/api/notes/:id` | DELETE | Delete note | Authenticated |

### Memories & Journal
| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/memories` | GET | Fetch all memories | Authenticated |
| `/api/memories` | POST | Create new memory | Authenticated |
| `/api/journal` | GET | Fetch journal entries | Authenticated |
| `/api/journal/today` | GET | Get today's journal entry | Authenticated |
| `/api/journal` | POST | Create journal entry | Authenticated |

### Folders Management
| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/folders` | GET | Fetch all folders | Authenticated |
| `/api/folders` | POST | Create new folder | Authenticated |
| `/api/folders/:id` | PUT | Update folder | Authenticated |
| `/api/folders/:id` | DELETE | Delete folder | Authenticated |

### Sharing & Collaboration
| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/sharing/notes/:noteId/share` | POST | Create shareable link | Authenticated |
| `/api/sharing/shared/:shareId` | GET | Access shared note | Public |
| `/api/sharing/shared/:shareId` | PUT | Update shared note | Public (with edit permission) |
| `/api/sharing/my-shares` | GET | Get user's shared notes | Authenticated |
| `/api/sharing/shares/:shareId` | DELETE | Revoke share link | Authenticated |

### Settings & Security
| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/settings` | GET | Get user settings | Authenticated |
| `/api/pins/set` | POST | Set PIN for section | Authenticated |
| `/api/pins/verify` | POST | Verify PIN for access | Authenticated |

### Recycle Bin
| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/recycle-bin` | GET | Get deleted items | Authenticated |
| `/api/recycle-bin/:id/restore` | POST | Restore deleted item | Authenticated |

### Export
| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/export/notes/:id/pdf` | GET | Generate PDF export | Authenticated |


## ✨ Key Features

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

### 💭 Memories & Journal Features
- **Dedicated Memories Section**: Store and organize personal memories
- **Daily Journal Entries**: Track daily thoughts and experiences
- **PIN Protection**: Secure access to sensitive sections
- **Enhanced Privacy**: Section-level security controls
- **OTP Verification**: Additional security for sensitive operations
- **Permanent Deletion**: Secure removal with OTP confirmation

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

### 🤝 Collaboration Features
- **Smart Sharing**: Create secure, time-limited share links
- **Custom Expiration**: 1 day to 10 years (3650 days)
- **Permission Control**: View-only or edit access levels
- **Anonymous Access**: No login required for shared notes
- **Real-time Editing**: Collaborative editing on shared notes
- **Access Management**: Track and revoke share links

### 🔍 Search & Organization
- Global search across notes and folders by title/content
- Advanced sorting (date created/updated, title A-Z/Z-A)
- Folder-based organization system
- Pagination for optimal performance
- Bulk operations (select and delete multiple items)
- Responsive design with mobile-friendly interface

### 📤 Export Features
- **PDF Export**: Generate and download notes as PDF with proper formatting
- **Download Management**: Automatic file naming and browser download handling

### ⚙️ Advanced Settings
- **User Preferences**: Customizable application settings
- **Feature Toggles**: Enable/disable specific features
- **Security Controls**: PIN protection for sensitive sections
- **Profile Management**: Update user information and preferences
- **Password Management**: Change password with OTP verification
- **Account Security**: Profile deletion with confirmation

### 🗑️ Recycle Bin & Data Management
- **Soft Delete**: Recover accidentally deleted items
- **Permanent Deletion**: Secure removal with OTP verification
- **Bulk Operations**: Restore or permanently delete multiple items
- **Auto Cleanup**: Automatic cleanup of expired items

### 🎯 User Experience
- Responsive design with TailwindCSS
- User dropdown with Profile/Settings/Logout
- Modal-based workflows for creating notes/folders
- Real-time feedback and loading states
- Clean, modern interface design
- Split-view editor (hidden on mobile)
- Note type indicators with emojis

## 🚀 Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Git

### Backend Setup
```bash
cd backend
npm install
npm start  # Runs on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:3000
```

### Environment Configuration

#### Backend (.env)
```bash
PORT=5000
NODE_ENV=development
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
FRONTEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
ENCRYPTION_KEY=your_32_byte_encryption_key
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

## 📁 Project Structure

```
noteBase/
├── frontend/                 # Next.js 14 application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   │   ├── dashboard/   # Main dashboard
│   │   │   ├── editor/      # Note editor
│   │   │   ├── memories/    # Memories section
│   │   │   ├── journal/     # Journal section
│   │   │   ├── settings/    # User settings
│   │   │   ├── recycle-bin/ # Deleted items
│   │   │   └── shared/      # Shared notes access
│   │   ├── components/      # Reusable UI components
│   │   │   ├── NoteEditor.js
│   │   │   ├── ShareModal.js
│   │   │   ├── SettingsModal.js
│   │   │   └── ...
│   │   ├── hooks/           # Custom React hooks
│   │   └── lib/             # API handlers, utilities
│   └── package.json
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   │   ├── authController.js
│   │   │   ├── notesController.js
│   │   │   ├── memoriesController.js
│   │   │   ├── journalController.js
│   │   │   ├── sharingController.js
│   │   │   └── ...
│   │   ├── routes/          # API route definitions
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── models/          # Database models
│   │   ├── utils/           # JWT, bcrypt, helpers
│   │   └── db/              # Database connection
│   └── package.json
└── README.md
```

## 📈 Development Phases

### Phase 1: ✅ Authentication System (Completed)
- JWT-based login/signup with refresh tokens
- Google OAuth 2.0 integration
- Email verification with OTP during signup
- Password reset functionality with OTP
- Remember me feature with localStorage/sessionStorage
- Protected routes and middleware

### Phase 2: ✅ Notes CRUD Operations (Completed)
- Create, read, update, delete notes and folders
- Three note types: Normal, Journal, Memory
- Rich text editor with minimized toolbar
- Auto-save functionality with unsaved changes detection
- Word count tracking and duplicate prevention

### Phase 3: ✅ Memories & Journal Features (Completed)
- Dedicated memories and journal sections
- PIN protection for sensitive content
- Enhanced privacy controls
- OTP verification for critical operations
- Secure deletion with confirmation

### Phase 4: ✅ Advanced Features (Completed)
- Search functionality across all content types
- Advanced sorting and filtering options
- Pagination for large datasets
- Folder management system
- Bulk operations and recycle bin

### Phase 5: ✅ Settings & Security (Completed)
- Comprehensive user settings panel
- Feature toggles and preferences
- PIN protection for sections
- Password management with OTP
- Profile deletion with security measures

### Phase 6: ✅ Collaboration System (Completed)
- Smart sharing with secure, time-limited links
- Permission control (view-only or edit access)
- Real-time collaborative editing
- Access management and analytics
- Anonymous editing capabilities

### Phase 7: 🚧 Final Features (In Progress)
- **Dark Mode**: Theme switching functionality
- **AI Integration**: Text summarization and grammar correction
- **Landing Page**: Marketing/welcome page
- **UI Polish**: Final animations and enhancements

## 🚀 Deployment

### Production Ready
- **Frontend**: Vercel deployment configured
- **Backend**: Render deployment configured
- **Database**: MongoDB Atlas with production settings
- **Environment**: Separate development and production configs
- **Security**: Production-grade security headers and rate limiting

### Available Scripts

#### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server (same as start)

#### Frontend Scripts
- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm start` - Start production server

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**NoteBase** - A modern, secure, and collaborative note-taking platform with advanced features for personal and team productivity.