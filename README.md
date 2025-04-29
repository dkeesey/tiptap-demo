# TipTap Collaborative Editor

A real-time collaborative rich text editor built with TipTap, React, and Y.js, featuring AI integration capabilities.

![TipTap Collaborative Editor](https://via.placeholder.com/1200x600?text=TipTap+Collaborative+Editor)

## [Live Demo](https://tiptap-demo-chi.vercel.app)

## Features

### Rich Text Editing
- Full-featured text editor with formatting toolbar
- Slash commands for Notion-like experience
- Support for headings, lists, code blocks, and more
- Markdown import/export functionality

### Real-Time Collaboration
- Concurrent editing with multiple users
- User presence indicators and collaborative cursors
- WebSocket synchronization with fallback to WebRTC
- Offline-first approach with CRDT conflict resolution

### AI Integration
- AI action menu for selected text
- AI-powered content suggestions
- Custom AI prompt nodes embedded in documents
- Contextual AI assistant sidebar

## Tech Stack

### Frontend
- **React** + **TypeScript**: UI component framework
- **TipTap**: Headless editor framework built on ProseMirror
- **Y.js**: CRDT implementation for conflict-free editing
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Build tool and development server

### Backend
- **Node.js**: JavaScript runtime
- **WebSocket**: Real-time communication protocol
- **Railway**: Backend hosting platform
- **Vercel**: Frontend hosting platform

## Architecture

The application uses a modern, scalable architecture:

```
Client Application (Browser)      WebSocket Server
┌─────────────────────────┐      ┌─────────────────┐
│  TipTap + React         │      │                 │
│  ┌─────────────────┐    │      │  Y.js Document  │
│  │ Y.js Client     │◄───┼─────►│  Synchronization│
│  └─────────────────┘    │      │                 │
└─────────────────────────┘      └─────────────────┘
```

- **Component-Based UI**: Modular React components
- **Headless Editor**: Content-agnostic editing core with custom UI
- **CRDT Synchronization**: Conflict-free real-time editing
- **WebSocket Communication**: Efficient real-time data transfer

See [Technical Architecture](./docs/technical-architecture.md) for more details.

## Technical Highlights

### WebSocket Optimization
The project implements an enhanced WebSocket server with:
- Optimized connection management
- Reduced logging and debugging overhead
- Graceful reconnection with exponential backoff
- Comprehensive error handling

See [Technical Challenges](./docs/technical-challenges.md) for detailed implementations.

### CSS Framework Management
Careful management of Tailwind CSS ensures consistent styling:
- Version-locked dependencies
- Custom configuration for cross-environment compatibility
- Optimized build process for production

### AI Integration Architecture
The AI features use a flexible integration approach:
- Service abstraction layer for multiple AI providers
- React context for state management
- Custom TipTap extensions for AI interactions

## Getting Started

### Prerequisites
- Node.js 14+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/dkeesey/tiptap-demo.git
cd tiptap-demo

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Setup

Create a `.env.local` file with:

```
VITE_WEBSOCKET_PRIMARY_URL=ws://localhost:1236
VITE_APP_TITLE=TipTap Collaborative Editor
ENABLE_COLLABORATION=true
```

### Running the WebSocket Server

```bash
# In a separate terminal
node EnhancedWebSocketServer.cjs
```

## Deployment

The project includes a comprehensive deployment script:

```bash
# Make executable
chmod +x deploy-all.sh

# Run deployment
./deploy-all.sh
```

This script will:
1. Check for required commands
2. Verify git status
3. Configure environment variables
4. Deploy the WebSocket server to Railway
5. Update Vercel environment variables
6. Deploy the frontend to Vercel
7. Verify the deployment

See [Deployment Guide](./memory-bank/post-presentation-deployment.md) for manual deployment steps.

## Project Background

This project was created as a technical demonstration for Wordware, showcasing expertise in:
- Modern JavaScript frameworks
- Real-time collaborative editing
- AI integration capabilities
- Responsive UI development
- Deployment and DevOps practices

The development process emphasized:
- Clean, maintainable code
- Comprehensive documentation
- Scalable architecture
- Performance optimization
- User experience design

## Technical Challenges and Solutions

The project overcame several significant challenges:

1. **WebSocket Connectivity Issues**
   - Fixed port mismatch between client and server
   - Added proper protocol constants
   - Implemented logging reduction
   - Enhanced connection handling and error resilience

2. **Tailwind CSS Version Management**
   - Locked Tailwind CSS to v3.3.2 to prevent version conflicts
   - Updated configuration for consistency across environments
   - Created compatibility layer for cross-version styling

3. **UI Component Behavior**
   - Fixed bubble menu persistence issues
   - Implemented proper selection state handling
   - Enhanced focus and blur management

See the [Technical Challenges](./docs/technical-challenges.md) document for detailed explanations.

## License

MIT

## Author

Dean Keesey
