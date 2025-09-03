import React, { useEffect, useState, useMemo, useCallback } from "react"
import { diffWords, diffLines, diffSentences, Change } from "diff"

interface SimpleTextHighlighterProps {
  originalText: string
  modifiedText: string
  className?: string
}

const SimpleTextHighlighter: React.FC<SimpleTextHighlighterProps> = ({
  originalText,
  modifiedText,
  className = ""
}) => {
  const [highlightedContent, setHighlightedContent] = useState<JSX.Element[]>(
    []
  )
  const [isProcessing, setIsProcessing] = useState(false)

  // Memoize the diff calculation to prevent unnecessary recalculations
  const diff = useMemo(() => {
    if (!originalText || !modifiedText) {
      return []
    }

    console.log("🔍 SimpleTextHighlighter: Computing diff", {
      originalLength: originalText.length,
      modifiedLength: modifiedText.length
    })

    // Add strict length check to prevent processing extremely large texts
    const MAX_TEXT_LENGTH = 25000 // Reduced from 50k to 25k for better performance
    if (
      originalText.length > MAX_TEXT_LENGTH ||
      modifiedText.length > MAX_TEXT_LENGTH
    ) {
      console.warn("⚠️ Text is too large for diff highlighting, skipping", {
        originalLength: originalText.length,
        modifiedLength: modifiedText.length,
        maxAllowed: MAX_TEXT_LENGTH
      })
      return []
    }

    let result: Change[]

    // Calculate all three types of diffs for smart selection
    const wordDiff = diffWords(originalText, modifiedText)
    const sentenceDiff = diffSentences(originalText, modifiedText)
    const lineDiff = diffLines(originalText, modifiedText)

    console.log("🔍 SimpleTextHighlighter - All diff types calculated:", {
      wordDiffLength: wordDiff.length,
      sentenceDiffLength: sentenceDiff.length,
      lineDiffLength: lineDiff.length,
      wordAdded: wordDiff.filter((p) => p.added).length,
      sentenceAdded: sentenceDiff.filter((p) => p.added).length,
      lineAdded: lineDiff.filter((p) => p.added).length
    })

    // Create a combined diff that merges all meaningful additions
    const combinedDiff: Change[] = []
    const processedTexts = new Set<string>()

    // First pass: Add all unchanged content from word diff (most granular)
    for (const part of wordDiff) {
      if (!part.added && !part.removed) {
        combinedDiff.push(part)
      }
    }

    // Second pass: Add all additions from line, sentence, and word levels
    const allDiffs = [lineDiff, sentenceDiff, wordDiff]

    for (const diffType of allDiffs) {
      for (const part of diffType) {
        if (part.added && part.value.trim().length > 1) {
          const text = part.value.trim()
          if (!processedTexts.has(text)) {
            processedTexts.add(text)
            combinedDiff.push(part)
          }
        }
      }
    }

    // Third pass: Add removed content if needed
    for (const part of wordDiff) {
      if (part.removed) {
        combinedDiff.push(part)
      }
    }

    result = combinedDiff
    console.log(
      `🎯 SimpleTextHighlighter created combined diff with ${
        result.filter((p) => p.added).length
      } unique additions from all levels`
    )

    console.log("✅ Diff computed:", { changesCount: result.length })
    return result
  }, [originalText, modifiedText])

  const generateHighlights = useCallback(() => {
    if (diff.length === 0) {
      setHighlightedContent([])
      return
    }

    setIsProcessing(true)
    console.log("🎨 Generating highlights...")

    // Add timeout protection
    const timeout = setTimeout(() => {
      console.error("⚠️ Highlight generation timed out, aborting")
      setIsProcessing(false)
      setHighlightedContent([
        <div key="timeout" className="text-red-600 p-4 text-center">
          ⚠️ Document too large for highlighting. Showing original content
          instead.
        </div>
      ])
    }, 10000) // 10 second timeout

    // Use setTimeout to prevent blocking the UI thread
    setTimeout(() => {
      try {
        const elements: JSX.Element[] = []

        diff.forEach((part, index) => {
          if (part.added) {
            elements.push(
              <mark
                key={index}
                className="diff-highlight-added"
                style={{
                  backgroundColor: "rgba(34, 197, 94, 0.15)",
                  padding: "1px 3px",
                  borderRadius: "2px",
                  borderLeft: "3px solid rgba(34, 197, 94, 0.6)",
                  borderTop: "none",
                  borderRight: "none",
                  borderBottom: "none",
                  color: "inherit",
                  position: "relative",
                  display: "inline"
                }}
                title="Added content">
                {part.value}
              </mark>
            )
          } else if (!part.removed) {
            // Only show unchanged content (skip removed content since we're showing the final version)
            elements.push(<span key={index}>{part.value}</span>)
          }
        })

        clearTimeout(timeout)
        console.log("✅ Highlights generated:", {
          elementsCount: elements.length
        })
        setHighlightedContent(elements)
        setIsProcessing(false)
      } catch (error) {
        clearTimeout(timeout)
        console.error("❌ Error generating highlights:", error)
        setIsProcessing(false)
        setHighlightedContent([
          <div key="error" className="text-red-600 p-4 text-center">
            ❌ Error generating highlights. Please try again.
          </div>
        ])
      }
    }, 100) // Small delay to prevent UI blocking
  }, [diff])

  // Helper function to format raw text into resume-like HTML structure
  const formatTextAsResume = (text: string): JSX.Element[] => {
    const lines = text.split("\n")
    const elements: JSX.Element[] = []
    let currentIndex = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) {
        elements.push(<br key={currentIndex++} />)
        continue
      }

      // Detect section headers (usually all caps or title case, short lines)
      const isHeader =
        line.length < 40 &&
        (line === line.toUpperCase() || /^[A-Z\s&]+$/.test(line)) &&
        !line.includes(".") &&
        !line.includes(",") &&
        !line.includes("(")

      // Detect name (usually the first non-empty line)
      const isName =
        i <= 2 &&
        line.length < 50 &&
        !line.includes("@") &&
        !line.includes("http")

      // Detect contact info (has email, phone, or URL patterns)
      const isContact =
        /[@.]/.test(line) || /\(\d{3}\)/.test(line) || /https?:\/\//.test(line)

      if (isName && i <= 2) {
        elements.push(<h1 key={currentIndex++}>{line}</h1>)
      } else if (isHeader) {
        elements.push(<h2 key={currentIndex++}>{line}</h2>)
      } else if (isContact) {
        elements.push(
          <p key={currentIndex++} className="contact-info">
            {line}
          </p>
        )
      } else if (line.startsWith("-") || line.startsWith("•")) {
        elements.push(<li key={currentIndex++}>{line.substring(1).trim()}</li>)
      } else {
        elements.push(<p key={currentIndex++}>{line}</p>)
      }
    }

    return elements
  }

  useEffect(() => {
    generateHighlights()
  }, [generateHighlights])

  return (
    <div
      className={`docx-wrapper w-full h-full overflow-auto bg-white p-4 ${className}`}>
      {/* Content with exact docx-wrapper styling - matches normal resume appearance exactly */}
      <div className="docx-content">
        {isProcessing ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Generating highlights...</div>
          </div>
        ) : diff.length === 0 && originalText && modifiedText ? (
          <div className="text-center py-8">
            <div className="text-orange-600 mb-2">
              ⚠️ Document too large for highlighting
            </div>
            <div className="text-sm text-gray-600 mb-4">
              Showing the tailored resume without highlights due to size
              limitations.
            </div>
            <div className="whitespace-pre-wrap text-gray-800 text-left max-h-96 overflow-y-auto border border-gray-200 p-4 rounded">
              {modifiedText}
            </div>
          </div>
        ) : (
          <div className="document-content whitespace-pre-wrap">
            {highlightedContent}
          </div>
        )}
      </div>
    </div>
  )
}

export default SimpleTextHighlighter
