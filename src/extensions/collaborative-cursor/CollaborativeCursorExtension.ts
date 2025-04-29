// Enhanced Collaborative Cursor Extension for TipTap
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Awareness } from 'y-protocols/awareness';

/**
 * Type definition for cursor user data
 */
export interface CursorUser {
  id: string;
  name: string;
  color: string;
  avatar?: string;
}

/**
 * Configuration options for the collaborative cursor extension
 */
export interface CollaborativeCursorOptions {
  // Awareness instance from y-protocols
  awareness?: Awareness;
  
  // Provider instance to extract awareness from if not specified directly
  provider?: any;
  
  // Show user names next to their cursors
  showUserName?: boolean;
  
  // Hide user names after this duration (ms)
  cursorNameVisibility?: number;
  
  // Custom render function for cursor decoration
  renderCursor?: (user: CursorUser) => HTMLElement;
  
  // Custom render function for user selection highlight
  renderSelection?: (user: CursorUser) => { className: string; style: string };
}

/**
 * CollaborativeCursor extension for TipTap
 * Shows remote users' cursors and selections in real-time
 */
export const CollaborativeCursorExtension = Extension.create<CollaborativeCursorOptions>({
  name: 'collaborativeCursor',

  // Default configuration
  addOptions() {
    return {
      awareness: undefined,
      provider: undefined,
      showUserName: true,
      cursorNameVisibility: 5000, // 5 seconds
      renderCursor: (user: CursorUser) => {
        // Create cursor element
        const cursor = document.createElement('div');
        cursor.classList.add('collaboration-cursor');
        cursor.setAttribute('data-user-id', user.id);
        cursor.style.position = 'absolute';
        cursor.style.pointerEvents = 'none';
        cursor.style.zIndex = '1000';
        
        // Add caret
        const caret = document.createElement('div');
        caret.classList.add('collaboration-cursor-caret');
        caret.style.position = 'absolute';
        caret.style.top = '0';
        caret.style.left = '0';
        caret.style.width = '2px';
        caret.style.height = '20px';
        caret.style.borderRadius = '4px';
        caret.style.backgroundColor = user.color;
        caret.style.transform = 'translateX(-50%)';
        cursor.appendChild(caret);
        
        // Add user label if enabled
        if (this.options.showUserName) {
          const label = document.createElement('div');
          label.classList.add('collaboration-cursor-label');
          label.style.position = 'absolute';
          label.style.top = '0';
          label.style.left = '0';
          label.style.padding = '3px 5px';
          label.style.borderRadius = '4px';
          label.style.color = 'white';
          label.style.fontSize = '12px';
          label.style.fontWeight = '500';
          label.style.whiteSpace = 'nowrap';
          label.style.transform = 'translateY(-100%) translateX(-50%)';
          label.style.opacity = '1';
          label.style.transition = 'opacity 0.3s ease';
          label.style.backgroundColor = user.color;
          label.textContent = user.name;
          cursor.appendChild(label);
          
          // Set up automatic hiding of the label
          if (this.options.cursorNameVisibility > 0) {
            setTimeout(() => {
              label.style.opacity = '0';
            }, this.options.cursorNameVisibility);
          }
        }
        
        return cursor;
      },
      renderSelection: (user: CursorUser) => {
        return {
          className: 'collaboration-cursor-selection',
          style: `background-color: ${user.color}2a;` // Add alpha transparency to color
        };
      }
    };
  },

  // Add CSS for cursor and selection styling
  addGlobalOptions() {
    return {
      CSS: `
        .collaboration-cursor-selection {
          background-color: rgba(155, 214, 255, 0.17);
          pointer-events: none;
        }
      `
    };
  },

  // Set up the ProseMirror plugin for cursor and selection handling
  addProseMirrorPlugins() {
    const { awareness, provider, renderCursor, renderSelection, showUserName } = this.options;
    
    // Get awareness from provider if not directly specified
    let awarenessInstance = awareness;
    if (!awarenessInstance && provider && provider.awareness) {
      awarenessInstance = provider.awareness;
    }
    
    // Can't proceed without awareness
    if (!awarenessInstance) {
      console.warn('CollaborativeCursor extension: No awareness instance found');
      return [];
    }
    
    // Create a plugin key
    const key = new PluginKey('collaborativeCursor');
    
    // Keep track of timeout for cursor visibility
    const cursorVisibilityTimeouts = new Map();
    
    // Helper to create decoration set from awareness states
    const createDecorations = (doc: any, awareness: Awareness) => {
      const decorations: any[] = [];
      const currentClientId = awareness.clientID;
      
      // Get all awareness states (excluding our own)
      const states = awareness.getStates();
      
      states.forEach((state: any, clientId: number) => {
        // Skip our own cursor
        if (clientId === currentClientId) return;
        
        // Skip clients without user data or cursor position
        if (!state) return;
        
        const user = state.user;
        const selection = state.selection;
        
        if (!user || !selection) return;
        
        // Get selection ranges (anchor and head)
        const { anchor, head } = selection;
        
        // Create selection decoration when range is not collapsed
        if (anchor !== head) {
          try {
            // Properly handle selections across nodes
            let from = Math.min(anchor, head);
            let to = Math.max(anchor, head);
            
            // Validate positions to avoid errors
            from = Math.max(0, Math.min(from, doc.content.size));
            to = Math.max(0, Math.min(to, doc.content.size));
            
            // Get selection style
            const { className, style } = renderSelection(user);
            
            decorations.push(
              Decoration.inline(from, to, {
                class: className,
                style
              })
            );
          } catch (err) {
            console.error('Error creating selection decoration:', err);
          }
        }
        
        // Create cursor (caret) decoration
        try {
          // Validate position
          const cursorPos = Math.max(0, Math.min(head, doc.content.size));
          
          // Create the cursor element
          const cursorDOM = renderCursor(user);
          
          decorations.push(
            Decoration.widget(cursorPos, () => cursorDOM, {
              key: `cursor-${clientId}`,
              side: 0
            })
          );
        } catch (err) {
          console.error('Error creating cursor decoration:', err);
        }
      });
      
      return DecorationSet.create(doc, decorations);
    };
    
    // Create and return the ProseMirror plugin
    return [
      new Plugin({
        key,
        state: {
          init: (_, { doc }) => createDecorations(doc, awarenessInstance),
          apply: (transaction, decorationSet, oldState, newState) => {
            // Update decorations on transaction
            return createDecorations(newState.doc, awarenessInstance);
          }
        },
        view: (view) => {
          // Update awareness with current selection when it changes
          const updateAwareness = () => {
            const { selection } = view.state;
            
            awarenessInstance.setLocalStateField('selection', {
              anchor: selection.anchor,
              head: selection.head
            });
          };
          
          // Set initial selection
          updateAwareness();
          
          // Subscribe to awareness changes
          const updateDecorations = () => {
            view.dispatch(view.state.tr.setMeta('updateCollaborationCursor', true));
          };
          
          awarenessInstance.on('change', updateDecorations);
          
          return {
            // Update on selection change
            update: (view, prevState) => {
              const { selection: oldSelection } = prevState;
              const { selection: newSelection } = view.state;
              
              if (oldSelection.anchor !== newSelection.anchor || oldSelection.head !== newSelection.head) {
                updateAwareness();
              }
            },
            
            // Clean up on destroy
            destroy: () => {
              awarenessInstance.off('change', updateDecorations);
              
              // Clear all timeouts
              cursorVisibilityTimeouts.forEach((timeout) => clearTimeout(timeout));
              cursorVisibilityTimeouts.clear();
            }
          };
        },
        props: {
          // Add decorations to the view
          decorations: (state) => {
            return key.getState(state);
          }
        }
      })
    ];
  }
});

export default CollaborativeCursorExtension;
