// Global TypeScript declarations

// Extend Window interface to include our custom properties
interface Window {
  __lastSlashCommandPopup?: any;
}

// Make TypeScript recognize our global window property
declare global {
  interface Window {
    __lastSlashCommandPopup?: any;
  }
}
