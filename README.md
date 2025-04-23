# TipTap Editor Demo

A demonstration of TipTap's capabilities, built with React, TypeScript, and Tailwind CSS.

## Features

- Rich text formatting (bold, italic, headings, lists, blockquotes)
- Context-specific menus (bubble menu, floating menu)
- Markdown import and export
- Automatic content saving with localStorage
- Clean, modern UI with Tailwind CSS
- Responsive design for all screen sizes

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/deankeesey/tiptap-demo.git
cd tiptap-demo
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to [http://localhost:5173](http://localhost:5173)

## Project Structure

```
tiptap-demo/
├── src/
│   ├── components/
│   │   ├── Editor/
│   │   │   └── TiptapEditor.tsx     # Main editor component
│   │   ├── Icons/                   # Icon components
│   │   ├── Menus/
│   │   │   ├── EditorBubbleMenu.tsx # Selection-based menu
│   │   │   └── EditorFloatingMenu.tsx # Empty paragraph menu
│   │   └── Toolbar/
│   │       ├── EditorToolbar.tsx    # Main formatting toolbar
│   │       └── MarkdownControls.tsx # Markdown import/export controls
│   ├── extensions/
│   │   └── tiptap-extensions-minimal.ts # TipTap extensions config
│   ├── hooks/                       # Custom React hooks
│   ├── styles/                      # CSS and style utilities
│   ├── utils/
│   │   ├── markdown.ts             # Markdown conversion utilities
│   │   └── storage.ts              # LocalStorage utilities
│   ├── App.tsx                     # Main application component
│   └── main.tsx                    # Application entry point
├── public/                         # Static assets
├── index.html                      # HTML template
├── tailwind.config.js              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
└── vite.config.ts                  # Vite configuration
```

## Key Technologies Used

- **[TipTap](https://tiptap.dev/)** - Headless WYSIWYG editor framework
- **[React](https://reactjs.org/)** - UI framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Vite](https://vitejs.dev/)** - Next generation frontend tooling
- **[Lucide Icons](https://lucide.dev/)** - Beautiful open-source icons
- **[Markdown-it](https://github.com/markdown-it/markdown-it)** - Markdown parsing

## Deployment

This project is deployed on Vercel. You can view the live demo at [https://tiptap-demo-deankeesey.vercel.app](https://tiptap-demo-deankeesey.vercel.app).

### Deployment Steps

1. Connect your GitHub repository to Vercel
2. Configure the build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Deploy

## Feature Implementation Details

### Rich Text Editing

The core editor functionality is implemented using TipTap extensions, with a clean separation of concerns between the editor instance, UI components, and utility functions.

### Contextual Menus

The editor provides two types of contextual menus:
- **Bubble Menu**: Appears when text is selected, offering inline formatting options
- **Floating Menu**: Appears when the cursor is in an empty paragraph, offering block-level formatting options

### Markdown Support

Markdown import/export is implemented through utilities that convert between HTML and Markdown formats. The user can:
- Import Markdown files
- Export current content as Markdown
- View the Markdown representation of the content
- Download the content as a Markdown file

### Persistence

The editor content is automatically saved to the browser's localStorage, ensuring that user edits persist between sessions.

## License

MIT
