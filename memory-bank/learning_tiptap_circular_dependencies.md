# TipTap Circular Dependency Resolution Learnings

## Problem Background
When working with TipTap in React applications, we frequently encountered runtime errors such as:
- `ReferenceError: Cannot access 'Pt' before initialization`
- `ReferenceError: Cannot access 'gt' before initialization`

These errors occurred specifically in the context of:
1. Production builds with Vercel
2. When using multiple TipTap extensions together
3. When the code worked locally but failed upon deployment

## Root Causes
The primary issues were:

1. **Circular Dependencies**: TipTap has a complex extension system where components may implicitly depend on each other, creating circular dependency chains.

2. **Initialization Order Problems**: JavaScript module evaluation order becomes critical when using TipTap, especially with complex extension configurations.

3. **Bundle Optimization Issues**: Webpack/Vite optimizations can sometimes reorder module initialization in ways that break TipTap's dependency expectations.

4. **StarterKit Dependencies**: Using the StarterKit with custom modifications often triggers these issues since it creates unexpected import chains.

## Effective Solutions

### 1. Minimal Extensions Approach
- Use only the absolute minimum set of required extensions
- Create a carefully ordered extension set that avoids circular dependencies
- Import core extensions (Document, Paragraph, Text) first, then formatting extensions

```typescript
// Example pattern that works
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
// Then other extensions...
```

### 2. Manual Extension Configuration
- Avoid using StarterKit when facing initialization issues
- Manually configure each individual extension
- When needed, selectively disable extensions within StarterKit rather than importing them separately

### 3. Build Configuration Optimizations
- Use Vite's manual chunk configuration to control how TipTap is bundled
- Explicitly include core TipTap packages in optimizeDeps
- Increase chunk size limits to prevent excessive code splitting of related modules

```typescript
// Vite config optimizations that help
optimizeDeps: {
  include: [
    '@tiptap/core',
    '@tiptap/pm/model',
    '@tiptap/pm/view',
    '@tiptap/pm/state',
    '@tiptap/extension-document',
    '@tiptap/extension-paragraph',
    '@tiptap/extension-text',
  ],
  force: true,
},
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'tiptap-core': ['@tiptap/core', '@tiptap/react'],
        'tiptap-pm': ['@tiptap/pm/model', '@tiptap/pm/view', '@tiptap/pm/state'],
        // Other chunks...
      },
    },
  },
}
```

### 4. Custom Extension Implementations
- For problematic extensions, create simplified versions with fewer dependencies
- For placeholder functionality, a lightweight custom extension can avoid dependencies:

```typescript
const MinimalPlaceholder = Extension.create({
  name: 'placeholder',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph'],
        attributes: {
          placeholder: {
            default: 'Start typing...',
            // Implementation details...
          },
        },
      },
    ]
  },
})
```

## Best Practices for Adding New Extensions

1. **Incremental Addition**: Add one extension at a time and test in production builds
2. **Dependency Ordering**: Always maintain correct import ordering (core modules first)
3. **Bundle Analysis**: Use tools like `rollup-plugin-visualizer` to detect circular dependencies
4. **Local Testing**: Test production builds locally with `npm run build && npm run preview`
5. **Extension Alternatives**: Consider lighter alternatives to complex extensions

## Extension Grouping Strategy

For larger TipTap implementations, organize extensions in these dependency groups:

1. **Core Schema** (Document, Paragraph, Text)
2. **Text Formatting** (Bold, Italic, etc.)
3. **Block Elements** (Headings, Lists, etc.)
4. **Complex Extensions** (Tables, Collaboration, etc.)
5. **Utility Extensions** (History, Placeholder, etc.)

Always maintain this order in imports and configuration to minimize circular dependency issues.
