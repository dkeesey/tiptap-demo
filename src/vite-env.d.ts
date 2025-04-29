/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly MODE: string
    readonly BASE_URL: string
    readonly PROD: boolean
    readonly DEV: boolean
    readonly SSR: boolean
    readonly VITE_WEBSOCKET_URL?: string
    // Add other env variables as needed
    [key: string]: string | undefined
  }
} 