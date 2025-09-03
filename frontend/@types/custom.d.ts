declare module "*.svg"
declare module "*.png"
declare module "*.jsx" {
  import { ReactElement } from "react"
  const component: () => ReactElement
  export default component
}

interface ImportMeta {
  env: {
    VITE_APP_BASE_URL: string
  }
}

// PDF.js type declarations for better TypeScript support
declare module "pdfjs-dist" {
  export interface PDFDocumentProxy {
    numPages: number
    getPage(pageNumber: number): Promise<PDFPageProxy>
  }

  export interface PDFPageProxy {
    getTextContent(): Promise<TextContent>
  }

  export interface TextContent {
    items: TextItem[]
  }

  export interface TextItem {
    str: string
    dir: string
    width: number
    height: number
    transform: number[]
    fontName: string
  }

  export const GlobalWorkerOptions: {
    workerSrc: string
  }

  export function getDocument(options: { data: ArrayBuffer }): {
    promise: Promise<PDFDocumentProxy>
  }

  export const version: string
}

declare global {
  interface Window {
    Tawk_API?: {
      hideWidget?: () => void
      showWidget?: () => void
      toggleVisibility?: () => void
      toggle?: () => void
      maximize?: () => void
      minimize?: () => void
      endChat?: () => void
      showMessage?: (message: string) => void
      setAttributes?: (attributes: Record<string, any>) => void
      addEvent?: (event: string, metadata?: Record<string, any>) => void
      addTags?: (tags: string[]) => void
      removeTags?: (tags: string[]) => void
    }
    Tawk_LoadStart?: Date
  }
}
