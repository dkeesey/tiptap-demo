# TipTap Editor Demo for Wordware

A progressive demonstration of TipTap's capabilities, showcasing how this headless rich text editor framework can be implemented for collaborative editing experiences.

## Purpose

This project is a technical demonstration of TipTap for a job application at Wordware, which uses TipTap as part of their AI development platform.

## Development Timeline

- Project Start: Tuesday, April 22, 2025
- Initial Deployment: Wednesday, April 23, 2025
- Feature Completion: Saturday, April 26, 2025
- Final Review: Sunday, April 27, 2025
- Presentation to Recruiter: Monday, April 28, 2025

## Planned Features

### Phase 1: Basic Implementation
- Core text editing capabilities
- Clean, minimalist UI
- Text formatting options (bold, italic, headings, lists)
- Mobile-responsive design

### Phase 2: Enhanced Experience
- Expanded toolbar with more formatting options
- Bubble menu for selected text
- Floating menu for empty paragraphs
- Document persistence (local storage)
- Markdown import/export
- Custom keyboard shortcuts

### Phase 3: Optional Advanced Features
- Collaborative editing (if time permits)
- AI integration features (if time permits)
- Custom extensions demonstration

## Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/tiptap-demo.git
cd tiptap-demo

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Project Structure

```
src/
├── components/     # UI components
│   ├── Editor/     # TipTap editor components
│   ├── Toolbar/    # Editor toolbar components
│   └── Menus/      # Floating and bubble menu components
├── hooks/          # Custom React hooks
├── extensions/     # Custom TipTap extensions
├── utils/          # Utility functions
└── styles/         # Global styles and CSS modules
```

## Technologies Used

- React with TypeScript
- TipTap editor framework
- TailwindCSS for styling
- Vite for build and development
- Vercel for deployment

## Deployment

The application is deployed on Vercel and can be accessed at [https://tiptap-demo.vercel.app](https://tiptap-demo.vercel.app) (placeholder URL).

## Learning Resources

- [TipTap Documentation](https://tiptap.dev/docs)
- [React Integration Guide](https://tiptap.dev/docs/editor/getting-started/install/react)
- [TipTap Examples](https://tiptap.dev/docs/examples)

## License

MIT
