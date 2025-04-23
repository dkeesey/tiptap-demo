# TipTap Demo - Enhanced Collaborative Version

This project demonstrates a rich text editor built with [TipTap](https://tiptap.dev/) that includes real-time collaboration features inspired by Wordware's implementation. The editor provides a Notion-like interface with slash commands and collaborative editing powered by Y.js.

## Features

- 📝 Rich text editing with TipTap
- 👥 Real-time collaboration with user cursors
- 💬 User presence indicators
- 🔄 Offline support with automatic syncing
- ⚡ Slash commands for quick actions
- 📱 Responsive design for all devices
- 📊 Markdown import/export
- 🎨 Clean, intuitive UI

## Technologies Used

- **React + TypeScript**: For the frontend framework
- **TipTap**: Headless editor framework
- **Y.js**: For conflict-free replicated data types (CRDT)
- **SyncedStore**: For structured state management
- **WebSockets**: For real-time communication
- **Tailwind CSS**: For styling

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository
```
git clone https://github.com/deankeesey/tiptap-demo.git
cd tiptap-demo
```

2. Install dependencies
```
npm install
```

3. Start the development server
```
npm run dev
```

4. (Optional) Start the WebSocket server for local collaboration
```
npm run websocket
```

## Collaboration Features

The editor supports real-time collaboration with the following features:

- **User cursors**: See where others are typing in real-time
- **User presence**: See who's currently editing the document
- **Offline support**: Continue editing when offline, changes sync automatically when reconnected
- **Conflict resolution**: Y.js handles merge conflicts automatically

## Slash Commands

Press `/` in the editor to bring up the slash command menu. Available commands:

- Text (paragraph)
- Headings (H1, H2)
- Lists (Bullet, Numbered)
- Blockquote
- Code Block
- Horizontal Rule
- AI Prompt (coming soon)

## Architecture

The project follows a clean architecture with:

1. **Data Layer**: Y.js documents with SyncedStore
2. **Collaboration Layer**: WebSocket provider with user awareness
3. **Editor Layer**: TipTap with custom extensions
4. **UI Layer**: React components with Tailwind CSS

## License

MIT

## Acknowledgments

- Inspired by Wordware's collaborative prompt engineering interface
- Built with TipTap, the headless editor framework
- Uses Y.js for conflict-free collaborative editing
