import React, { useEffect, useRef, useState, useCallback } from "react"
import { diffWords, diffLines, diffSentences, Change } from "diff"
import * as mammoth from "mammoth"

interface DocumentDiffHighlighterProps {
  originalDocumentUrl: string
  modifiedDocumentUrl: string
  mode?: "words" | "lines" | "sentences"
  className?: string
  onTextExtracted?: (originalText: string, modifiedText: string) => void
}

interface HighlightOverlay {
  text: string
  type: "added" | "removed" | "unchanged"
  position?: {
    top: number
    left: number
    width: number
    height: number
  }
}

const DocumentDiffHighlighter: React.FC<DocumentDiffHighlighterProps> = ({
  originalDocumentUrl,
  modifiedDocumentUrl,
  mode = "words",
  className = "",
  onTextExtracted
}) => {
  const originalContainerRef = useRef<HTMLDivElement>(null)
  const modifiedContainerRef = useRef<HTMLDivElement>(null)
  const [highlights, setHighlights] = useState<HighlightOverlay[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [originalText, setOriginalText] = useState("")
  const [modifiedText, setModifiedText] = useState("")

  // Extract text from DOCX files
  const extractTextFromDocx = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      return result.value
    } catch (error) {
      console.error("Error extracting text from DOCX:", error)
      return ""
    }
  }

  // Extract text from HTML content (for PDF.js rendered content)
  const extractTextFromHTML = (element: HTMLElement): string => {
    return element.innerText || element.textContent || ""
  }

  // Generate diff and create highlights
  const generateHighlights = useCallback(
    (original: string, modified: string) => {
      let diff: Change[]

      switch (mode) {
        case "lines":
          diff = diffLines(original, modified)
          break
        case "sentences":
          diff = diffSentences(original, modified)
          break
        default:
          diff = diffWords(original, modified)
      }

      const newHighlights: HighlightOverlay[] = diff.map((part) => ({
        text: part.value,
        type: part.added ? "added" : part.removed ? "removed" : "unchanged"
      }))

      setHighlights(newHighlights)
    },
    [mode]
  )

  // Process documents and extract text
  useEffect(() => {
    const processDocuments = async () => {
      setIsProcessing(true)

      try {
        let originalTextContent = ""
        let modifiedTextContent = ""

        // Handle different document types
        if (
          originalDocumentUrl.includes(".docx") ||
          originalDocumentUrl.includes("application/vnd.openxmlformats")
        ) {
          originalTextContent = await extractTextFromDocx(originalDocumentUrl)
        } else if (originalContainerRef.current) {
          // For rendered HTML content (PDF.js, etc.)
          originalTextContent = extractTextFromHTML(
            originalContainerRef.current
          )
        }

        if (
          modifiedDocumentUrl.includes(".docx") ||
          modifiedDocumentUrl.includes("application/vnd.openxmlformats")
        ) {
          modifiedTextContent = await extractTextFromDocx(modifiedDocumentUrl)
        } else if (modifiedContainerRef.current) {
          // For rendered HTML content
          modifiedTextContent = extractTextFromHTML(
            modifiedContainerRef.current
          )
        }

        setOriginalText(originalTextContent)
        setModifiedText(modifiedTextContent)

        if (originalTextContent && modifiedTextContent) {
          generateHighlights(originalTextContent, modifiedTextContent)
          onTextExtracted?.(originalTextContent, modifiedTextContent)
        }
      } catch (error) {
        console.error("Error processing documents:", error)
      } finally {
        setIsProcessing(false)
      }
    }

    if (originalDocumentUrl && modifiedDocumentUrl) {
      processDocuments()
    }
  }, [
    originalDocumentUrl,
    modifiedDocumentUrl,
    generateHighlights,
    onTextExtracted
  ])

  // Create overlay highlights on the modified document
  const createOverlayHighlights = useCallback(() => {
    if (!modifiedContainerRef.current || highlights.length === 0) return

    const container = modifiedContainerRef.current
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null
    )

    const textNodes: Text[] = []
    let node
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text)
    }

    // Clear existing highlights
    const existingHighlights = container.querySelectorAll(
      ".diff-highlight-overlay"
    )
    existingHighlights.forEach((el) => el.remove())

    let currentTextIndex = 0
    let currentHighlightIndex = 0

    highlights.forEach((highlight, index) => {
      if (highlight.type === "added") {
        // Find the text node that contains this change
        const text = highlight.text
        const fullText = modifiedText
        const startIndex = fullText.indexOf(text, currentTextIndex)

        if (startIndex !== -1) {
          // Create overlay element
          const overlay = document.createElement("span")
          overlay.className = "diff-highlight-overlay diff-added-overlay"
          overlay.style.cssText = `
            position: absolute;
            background-color: rgba(34, 197, 94, 0.3);
            border: 1px solid rgba(34, 197, 94, 0.6);
            pointer-events: none;
            z-index: 1000;
            border-radius: 2px;
          `

          // This is a simplified approach - in a real implementation,
          // you'd need more sophisticated text positioning
          container.appendChild(overlay)
          currentTextIndex = startIndex + text.length
        }
      }
      currentHighlightIndex++
    })
  }, [highlights, modifiedText])

  useEffect(() => {
    createOverlayHighlights()
  }, [createOverlayHighlights])

  return (
    <div className={`document-diff-highlighter ${className}`}>
      {isProcessing && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="flex items-center gap-2 text-white">
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
            <span>Processing documents for highlighting...</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        {/* Original Document */}
        <div className="relative">
          <div className="mb-2 text-sm font-medium text-gray-300">
            Original Resume
          </div>
          <div
            ref={originalContainerRef}
            className="h-full border border-gray-600 rounded-lg overflow-hidden bg-white relative">
            {originalDocumentUrl.startsWith("http") ? (
              <iframe
                src={originalDocumentUrl}
                className="w-full h-full"
                title="Original Resume"
              />
            ) : (
              <div
                className="w-full h-full bg-white"
                id="original-document-container"
              />
            )}
          </div>
        </div>

        {/* Modified Document with Highlights */}
        <div className="relative">
          <div className="mb-2 text-sm font-medium text-gray-300 flex items-center gap-2">
            Tailored Resume
            <span className="px-2 py-1 bg-green-900/40 text-green-200 text-xs rounded border border-green-400">
              Changes Highlighted
            </span>
          </div>
          <div
            ref={modifiedContainerRef}
            className="h-full border border-green-500 rounded-lg overflow-hidden bg-white relative">
            {modifiedDocumentUrl.startsWith("http") ? (
              <iframe
                src={modifiedDocumentUrl}
                className="w-full h-full"
                title="Tailored Resume"
              />
            ) : (
              <div
                className="w-full h-full bg-white"
                id="modified-document-container"
              />
            )}
          </div>
        </div>
      </div>

      {/* Highlights Summary */}
      {highlights.length > 0 && (
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-600">
          <div className="text-sm font-medium text-gray-200 mb-2">
            Changes Summary
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-900/40 border border-green-400 rounded"></div>
              <span className="text-green-200">
                {highlights.filter((h) => h.type === "added").length} additions
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-900/40 border border-red-400 rounded"></div>
              <span className="text-red-200">
                {highlights.filter((h) => h.type === "removed").length} removals
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentDiffHighlighter
