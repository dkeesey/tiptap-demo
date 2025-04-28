# TipTap Editor Menus

This folder contains the menu components for the TipTap editor. The editor uses two different types of menus that serve distinct purposes:

## 1. Bubble Menu (EditorBubbleMenu.tsx)

The Bubble Menu appears when text is selected and focuses on inline text formatting options.

### Features:
- Appears when text is selected
- Positioned near the selected text
- Contains text-level formatting options:
  - Bold, Italic, Underline
  - Highlight
  - Link
  - Inline Code
  - Text Alignment

### User Experience:
- Select text to format
- Menu appears with formatting options
- Changes apply to the selected text only

## 2. Floating Menu (EditorFloatingMenu.tsx)

The Floating Menu appears when the cursor is at an empty line and focuses on block-level formatting.

### Features:
- Appears only on completely empty lines
- Has a slight delay (500ms) to avoid being intrusive
- Contains block-level formatting options:
  - Headings (H1, H2, H3)
  - Lists (Bullet, Ordered)
  - Blockquotes
  - Code Blocks
  - Tables
  - Images
  - Horizontal Rules

### User Experience:
- Position cursor at the beginning of an empty line
- Wait briefly for menu to appear
- Select a block format to apply to the entire line/paragraph

## Menu Design Principles

1. **Context-specific tools**: Different menus appear in different contexts, providing the most relevant options.
2. **Clear purpose separation**: Each menu has a distinct purpose:
   - Bubble Menu: Format existing text (character-level)
   - Floating Menu: Structure content (block-level)
3. **Minimal intrusion**: Menus appear only when needed and in appropriate contexts.
4. **Visual clarity**: Headers and organization help users understand the purpose of each menu.

## Alternative: Slash Commands

In addition to these menus, the editor also supports slash commands:
- Type `/` to access a command menu
- Offers a searchable list of both inline and block-level formatting options
- Less intrusive as it only appears when explicitly triggered
- Supports power users with keyboard-driven workflows

## Best Practices

- Bubble and Floating menus provide discoverability for new users
- Slash commands provide efficiency for experienced users
- Use a combination of both approaches to support different user preferences
