import './globals.css'

export const metadata = {
  title: 'NoteBase - Smart Notes Management',
  description: 'A personalized note management application with AI integration',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}