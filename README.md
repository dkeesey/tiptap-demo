# TipTap Collaborative Editor Demo

A demonstration of TipTap's capabilities for building a collaborative, Notion-like text editor with real-time collaboration and AI-powered features.

## 🌟 Features

- **Rich Text Editing**: Format text with a comprehensive toolbar
- **Real-time Collaboration**: Edit together with others using Y.js and WebSockets
- **Slash Commands**: Create content quickly with a Notion-like slash command menu
- **AI Integration**: AI-powered writing assistance throughout the editor experience
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

## 🤖 AI Features

This demo includes several AI-powered features:

### AI Prompts
Create AI prompt blocks directly in your document:
1. Type `/` and select any AI prompt type from the menu
2. Enter your prompt in the text area
3. Click 'Generate' or press Ctrl+Enter
4. See the AI-generated response

### AI Sidebar
Access the AI assistant sidebar for more comprehensive AI interactions:
1. Click the sidebar toggle on the right side of the editor
2. Use the chat tab to have a conversation about your document
3. Access pre-defined AI actions from the actions tab
4. Configure AI settings in the settings tab

### AI Actions Menu
Transform selected text using AI:
1. Select text in your document
2. Use the AI actions menu that appears above the selection
3. Choose from options like summarize, expand, rewrite, or explain
4. The selected text will be replaced with the AI-processed version

### Available AI Actions
- **Summarize**: Create a concise summary of selected text
- **Expand**: Add more detail to selected text
- **Rewrite**: Improve clarity and style of selected text
- **Explain**: Explain concepts in simpler terms
- **Translate**: Translate text to another language
- **Brainstorm**: Generate ideas related to the selected text

> Note: This is a demo using simulated AI responses. In a production environment, these features would connect to actual AI APIs like OpenAI or Anthropic.

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

### Text Formatting
- Text (paragraph)
- Headings (H1, H2)
- Lists (Bullet, Numbered)
- Blockquote
- Code Block
- Horizontal Rule

### AI Commands
- AI Prompt (General purpose)
- AI Explain (Explain concepts)
- AI Summarize (Summarize text)
- AI Improve (Enhance writing)
- AI Code (Coding assistance)
- AI Brainstorm (Generate ideas)
- AI Translate (Translate text)
- AI Complete (Continue writing)
- AI Transform Selection (Process selected text)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Thanks to the [TipTap](https://tiptap.dev/) team for creating an amazing editor framework
- Inspired by the collaborative editing experience in products like Notion and Wordware
