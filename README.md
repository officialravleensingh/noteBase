# NoteBase - A Smart Personalised Notes Management Application

A complete full-stack note management system designed for a modern, personalized note-taking experience with AI integration, collaboration features, and intelligent assistance.

## Problem Statement

Managing and organizing notes across devices often becomes cluttered, and most apps lack personalization, collaboration, and intelligent assistance. **NoteBase** aims to solve this by providing a secure, customizable, and AI-powered note management system where users can create, organize, and share notes, collaborate in shared spaces, and use AI tools for summarization and grammar correction.

## System Architecture

```
Frontend → Backend (API) → Database → AI Integration (API)
```

## Tech Stack

- **Frontend**: Next.js, React Router, TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT-based login/signup + bcrypt
- **AI Integration**: API for summarization and grammar correction
- **Hosting**: 
  - Frontend: Vercel/Netlify
  - Backend: Render/Railway
  - Database: MongoDB Atlas

## API Endpoints

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/api/auth/signup` | POST | Register new user | Public |
| `/api/auth/login` | POST | User login | Public |
| `/api/notes` | GET | Fetch all notes (with search, filter, sort, pagination) | Authenticated |
| `/api/notes` | POST | Create new note | Authenticated |
| `/api/notes/:id` | PUT | Update note | Authenticated |
| `/api/notes/:id` | DELETE | Delete note | Authenticated |
| `/api/shared` | POST | Create shared note | Authenticated |

## Key Features

### Authentication & Authorization
- JWT login/signup system
- Shared-note creator acts as admin for permission control

### CRUD Operations
- Create, Read, Update, Delete notes and folders
- Full note management lifecycle

### Personalization
- Dark/Light theme toggle
- Custom fonts and layouts
- Personalized user experience

### Rich Text Editing
- Bold, italics, bullet points
- Tables, emojis, image upload
- Advanced formatting options

### Search & Organization
- Search by title/content
- Sort by last edited date or name
- Folder-like grouping
- List/grid view options

### Advanced Features
- **Search, Sort, Filter & Pagination**: Optimized data retrieval for large note sets
- **Collaborative Notes**: Shared notes with customizable permissions
- **History Tracking**: Admin user tracking for shared notes
- **Export Functionality**: Notes export as PDFs
- **AI Integration**: Summarization, grammar correction, and writing suggestions

## Project Structure

```
noteBase/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # API handlers, utilities
│   │   └── types/           # TypeScript definitions
│   └── public/              # Static assets
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic layer
│   │   ├── middleware/      # Auth, validation, error handling
│   │   └── utils/           # JWT, bcrypt, helpers
│   ├── config/              # Database configuration
│   ├── prisma/              # Database schema
│   └── server.js            # Server entry point
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
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

**Backend (.env)**
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="your_mongodb_connection_string"
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Development Phases

### Phase 1: ✅ Authentication System
- JWT-based login/signup
- Protected routes
- User management
- Database integration

### Phase 2: 🚧 Notes CRUD Operations
- Create, read, update, delete notes
- Rich text editor integration
- Note organization

### Phase 3: 📋 Advanced Features
- Search, filter, sort, pagination
- Folder management
- Collaborative notes

### Phase 4: 🤖 AI Integration
- Text summarization
- Grammar correction
- Writing suggestions

### Phase 5: 🎨 Personalization
- Theme customization
- Layout preferences
- Export functionality

## Deployment

- **Frontend**: Vercel/Netlify
- **Backend**: Render/Railway
- **Database**: MongoDB Atlas
- **Environment**: Production-ready with environment variables

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