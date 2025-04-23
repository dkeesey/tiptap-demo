# TipTap Demo - Project Rules and Intelligence

## Code and Architecture Patterns

### React Component Structure
- Use functional components with hooks
- Follow a clear component hierarchy
- Keep components focused on single responsibilities
- Use TypeScript interfaces for props and state

### TipTap Implementation
- Configure editor through extensions
- Create clear abstractions around the TipTap API
- Follow the "headless UI" paradigm
- Implement custom UI components for all editor controls

### Styling Approach
- Use TailwindCSS as the primary styling solution
- Maintain consistent spacing and typography
- Ensure responsive design across device sizes
- Use CSS variables for theming when appropriate
- Include the Tailwind Typography plugin for rich text styling

### State Management
- Use React context for editor state when necessary
- Keep state close to where it's used
- Minimize prop drilling
- Use local storage for document persistence

### Performance Practices
- Memoize components when appropriate
- Use virtualization for large documents
- Debounce expensive operations
- Lazy-load extensions and components when possible

## Coding Standards

### TypeScript Usage
- Use proper typing for all components and functions
- Avoid 'any' type where possible
- Create interfaces for complex data structures
- Use type guards when necessary

### Component Guidelines
- Keep components focused and small
- Use composition over inheritance
- Extract repeated logic to custom hooks
- Document complex components

### Documentation
- Add JSDoc comments for non-obvious functions
- Document key architectural decisions
- Keep the README up to date
- Document props for reusable components

### Testing
- For this demo, focus on manual testing
- Test across different browsers and devices
- Validate keyboard accessibility

## Project Management

### Time Management
- Focus on core functionality first
- Polish only after basics are working
- Assess feasibility of advanced features based on progress
- Allow time for testing and bug fixing

### Feature Prioritization
1. Core editor functionality
2. Clean, intuitive UI
3. Document persistence
4. Advanced editing features
5. Optional: Collaboration
6. Optional: AI integration

### Commit Guidelines
- Use clear, descriptive commit messages
- Commit frequently with focused changes
- Push regularly to backup work
- Keep the main branch stable

## Deployment Strategy

### Deployment Process
- Set up continuous deployment with Vercel
- Deploy early and often
- Use branch previews for testing changes
- Ensure proper configuration for production builds

### Environment Management
- Keep development and production environments consistent
- Use environment variables for configuration where needed
- Document any environment-specific settings

## Key Learnings and Insights

### TipTap Architecture
- TipTap is built on ProseMirror, a low-level editor toolkit
- The extension system is central to TipTap's architecture
- TipTap is "headless" - it provides functionality but no UI
- The React integration simplifies binding to React components
- TipTap's component hierarchy involves three main components: Editor, EditorContent, and extensions

### TipTap Extensions
- Extensions are modular pieces that add functionality to the editor
- The StarterKit extension bundle includes most common editing features
- Custom extensions can be created for specialized functionality
- Extensions can be configured with options to customize behavior
- Extensions can be combined and composed to create complex editors

### UI Implementation
- The bubble menu appears when text is selected
- The floating menu appears on empty paragraphs
- Toolbars provide persistent access to editor commands
- Each menu/toolbar component receives the editor instance as a prop
- The editor's state can be queried to determine which formatting is active

### Styling Considerations
- TipTap requires the Tailwind Typography plugin for prose styling
- Editor content can be styled using standard CSS or Tailwind classes
- The ProseMirror class is the main entry point for styling editor content
- Custom styling can be applied to specific node types (headings, lists, etc.)
- Responsive design requires careful consideration of toolbar layouts

### Document Persistence
- localStorage provides a simple way to persist editor content
- The editor's HTML can be accessed via editor.getHTML()
- Content can be loaded into the editor through the content prop
- The onUpdate callback is used to capture content changes

### Wordware Integration
- Wordware uses TipTap for collaborative editing of AI prompts
- TipTap's collaboration extensions are particularly relevant for Wordware's use case
- Understanding how to integrate TipTap with other technologies (like AI) is valuable
- The clean, extensible nature of TipTap matches Wordware's development philosophy

### Development Workflow
- Start with official examples and documentation
- Build incrementally, starting with core functionality
- Test frequently to catch styling or functionality issues early
- Use TypeScript for better developer experience and type safety
- Tailwind CSS provides rapid UI development capabilities
