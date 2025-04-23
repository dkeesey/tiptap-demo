# TipTap Collaborative Editor Demo

A demonstration of TipTap's capabilities for building a collaborative, Notion-like text editor with real-time collaboration.

## 🌟 Features

- **Rich Text Editing**: Format text with a comprehensive toolbar
- **Real-time Collaboration**: Edit together with others using Y.js and WebSockets
- **Slash Commands**: Create content quickly with a Notion-like slash command menu
- **User Presence**: See who's editing and where their cursor is
- **Offline Support**: Keep working when offline with automatic syncing when reconnected
- **Markdown Support**: Import and export content as Markdown
- **Responsive Design**: Works on mobile and desktop
- **Local Storage**: Content is saved automatically

## 🚀 Try It Live

Visit the [TipTap Demo](https://tiptap-demo.vercel.app/) to see it in action.

## 🔧 Built With

- [React](https://reactjs.org/) - UI Framework
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [TipTap](https://tiptap.dev/) - Headless Editor Framework
- [Y.js](https://yjs.dev/) - CRDT for Real-time Collaboration
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## 📋 How to Use Collaboration

1. Toggle the "Collaboration Mode" switch at the top of the editor
2. Share the room name with others who want to collaborate
3. See users' cursors and edits in real-time
4. Create a new room if you want to start a fresh collaboration

## 💻 Local Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/deankeesey/tiptap-demo.git
cd tiptap-demo

# Install dependencies
npm install

# Start the development server
npm run dev

# (Optional) Start the WebSocket server for local collaboration
npm run websocket
```

## 📝 Slash Commands

Type `/` in the editor to access the slash command menu:

- Text (paragraph)
- Headings (H1, H2)
- Lists (Bullet, Numbered)
- Blockquote
- Code Block
- Horizontal Rule
- AI Prompt (coming soon)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Thanks to the [TipTap](https://tiptap.dev/) team for creating an amazing editor framework
- Inspired by the collaborative editing experience in products like Notion and Wordware
