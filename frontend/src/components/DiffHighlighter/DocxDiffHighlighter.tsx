import React, { useEffect, useState, useRef } from "react"
import { diffWords, diffLines, diffSentences, Change } from "diff"
import * as mammoth from "mammoth"

interface DocxDiffHighlighterProps {
  originalDocxUrl: string
  modifiedDocxUrl: string
  className?: string
  onRender?: (htmlContent: string) => void
  originalText?: string
  modifiedText?: string
  onError?: (error: Error) => void
}

const DocxDiffHighlighter: React.FC<DocxDiffHighlighterProps> = ({
  originalDocxUrl,
  modifiedDocxUrl,
  className = "",
  onRender,
  originalText: preExtractedOriginalText,
  modifiedText: preExtractedModifiedText,
  onError
}) => {
  const [baseHtml, setBaseHtml] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [highlightProgress, setHighlightProgress] = useState(0)
  const [error, setError] = useState<string>("")
  const containerRef = useRef<HTMLDivElement>(null)

  const extractTextsFromDocuments = async () => {
    setIsProcessing(true)
    setError("")

    try {
      console.log("🔍 Starting document processing...")
      console.log("Original URL:", originalDocxUrl)
      console.log("Modified URL:", modifiedDocxUrl)

      // Fetch both documents
      const [originalBuffer, modifiedBuffer] = await Promise.all([
        fetchDocxAsArrayBuffer(originalDocxUrl),
        fetchDocxAsArrayBuffer(modifiedDocxUrl)
      ])

      // Extract text and HTML from both documents
      const [originalData, modifiedData] = await Promise.all([
        extractTextAndHtml(originalBuffer),
        extractTextAndHtml(modifiedBuffer)
      ])

      console.log("📝 Extracted texts:", {
        originalLength: originalData.text.length,
        modifiedLength: modifiedData.text.length
      })

      // Process with the extracted texts
      processWithTexts(originalData.text, modifiedData.text, modifiedData.html)
    } catch (err) {
      console.error("❌ Error processing documents:", err)
      const errorObject =
        err instanceof Error ? err : new Error("Unknown error occurred")
      setError(errorObject.message)
      onError?.(errorObject)
    } finally {
      setIsProcessing(false)
    }
  }

  const processWithTexts = async (
    originalTextContent: string,
    modifiedTextContent: string,
    modifiedHtmlContent?: string
  ) => {
    setIsProcessing(true)
    setError("")

    try {
      let htmlToProcess = modifiedHtmlContent

      // If we don't have HTML content, try to generate it from the modified document
      if (
        !htmlToProcess &&
        modifiedDocxUrl &&
        !modifiedDocxUrl.startsWith("test://")
      ) {
        const modifiedBuffer = await fetchDocxAsArrayBuffer(modifiedDocxUrl)
        const modifiedData = await extractTextAndHtml(modifiedBuffer)
        htmlToProcess = modifiedData.html
      }

      // If still no HTML content, create a simple HTML representation from the text
      if (!htmlToProcess) {
        console.log("📄 Creating simple HTML from text content")
        htmlToProcess = convertTextToSimpleHtml(modifiedTextContent)
      }

      // Set base HTML first for immediate rendering
      setBaseHtml(htmlToProcess)
      setHighlightProgress(0)
      setIsProcessing(false)

      // Apply highlights progressively without blocking UI
      await applyHighlightsProgressively(
        originalTextContent,
        modifiedTextContent,
        htmlToProcess
      )

      onRender?.(htmlToProcess) // Pass the base HTML for now
    } catch (error) {
      console.error("Error processing texts:", error)
      const errorObject =
        error instanceof Error
          ? error
          : new Error("Failed to process document content")
      setError(errorObject.message)
      onError?.(errorObject)
      setIsProcessing(false)
    }
  }

  // Helper function to convert plain text to simple HTML
  const convertTextToSimpleHtml = (text: string): string => {
    return text
      .split("\n")
      .map((line) => {
        const trimmedLine = line.trim()
        if (!trimmedLine) return "<br>"

        // Simple heuristics for formatting
        if (trimmedLine.includes(":") && !trimmedLine.startsWith("-")) {
          return `<h3>${trimmedLine}</h3>`
        }
        if (trimmedLine.startsWith("-")) {
          return `<li>${trimmedLine.substring(1).trim()}</li>`
        }
        return `<p>${trimmedLine}</p>`
      })
      .join("")
  }

  // Use pre-extracted text if available, otherwise extract from documents
  useEffect(() => {
    const startTime = performance.now()
    console.log("🔍 DocxDiffHighlighter useEffect triggered")

    // Check for unsupported URL schemes first
    const hasUnsupportedScheme =
      originalDocxUrl.startsWith("temp://") ||
      modifiedDocxUrl.startsWith("temp://") ||
      originalDocxUrl.startsWith("vscode://") ||
      modifiedDocxUrl.startsWith("vscode://") ||
      originalDocxUrl.startsWith("test://") ||
      modifiedDocxUrl.startsWith("test://")

    if (hasUnsupportedScheme) {
      console.warn(
        "⚠️ Unsupported URL scheme detected, using pre-extracted text if available",
        {
          originalUrl: originalDocxUrl,
          modifiedUrl: modifiedDocxUrl,
          hasPreExtractedText: Boolean(
            preExtractedOriginalText && preExtractedModifiedText
          )
        }
      )

      // If we have pre-extracted text, use it; otherwise error
      if (preExtractedOriginalText && preExtractedModifiedText) {
        console.log("📄 Using pre-extracted texts for unsupported URL scheme")
        processWithTexts(preExtractedOriginalText, preExtractedModifiedText)
        return
      } else {
        const error = new Error(
          `Unsupported URL scheme detected: ${originalDocxUrl}`
        )
        onError?.(error)
        return
      }
    }

    if (preExtractedOriginalText && preExtractedModifiedText) {
      console.log("📄 Using pre-extracted texts for highlighting", {
        originalLength: preExtractedOriginalText.length,
        modifiedLength: preExtractedModifiedText.length
      })
      processWithTexts(preExtractedOriginalText, preExtractedModifiedText)
    } else {
      console.log("📄 Extracting texts from documents")
      extractTextsFromDocuments()
    }

    const endTime = performance.now()
    console.log(`⏱️ DocxDiffHighlighter setup took ${endTime - startTime}ms`)
  }, [
    originalDocxUrl,
    modifiedDocxUrl,
    preExtractedOriginalText,
    preExtractedModifiedText
  ])

  const fetchDocxAsArrayBuffer = async (url: string): Promise<ArrayBuffer> => {
    try {
      console.log("📄 Fetching DOCX from URL:", url)

      // Check if this is an S3 URL that needs to be proxied
      const isS3Url =
        url.includes("s3.amazonaws.com") || url.includes("amazonaws.com")

      let fetchUrl = url
      if (isS3Url) {
        // Use the backend proxy endpoint to avoid CORS issues
        const encodedS3Url = encodeURIComponent(url)
        fetchUrl = `${
          import.meta.env.VITE_APP_BASE_URL || "http://localhost:3001"
        }/api/ai-resume-tailor/stream-s3-file?url=${encodedS3Url}`
        console.log("📄 Using proxy URL for S3:", fetchUrl)
      }

      const response = await fetch(fetchUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.statusText}`)
      }
      return response.arrayBuffer()
    } catch (error) {
      console.error("Error fetching DOCX:", error)
      throw error
    }
  }

  const extractTextAndHtml = async (arrayBuffer: ArrayBuffer) => {
    try {
      // Extract both raw text and HTML with better style mapping
      const textResult = await mammoth.extractRawText({ arrayBuffer })
      const htmlResult = await mammoth.convertToHtml(
        { arrayBuffer },
        {
          styleMap: [
            "p[style-name='Heading 1'] => h1.resume-heading",
            "p[style-name='Heading 2'] => h2.resume-subheading",
            "p[style-name='Heading 3'] => h3.resume-section",
            "b => strong",
            "i => em",
            "p[style-name='Normal'] => p.resume-text"
          ]
        }
      )

      return {
        text: textResult.value,
        html: htmlResult.value
      }
    } catch (error) {
      console.error("Error extracting text and HTML:", error)
      throw error
    }
  }

  const applyHighlightsProgressively = async (
    originalText: string,
    modifiedText: string,
    baseHtmlContent: string
  ) => {
    const startTime = performance.now()
    console.log("🎨 Starting progressive highlight application...", {
      originalLength: originalText.length,
      modifiedLength: modifiedText.length,
      htmlLength: baseHtmlContent.length
    })

    // Wait for DOM to be ready
    await new Promise((resolve) => setTimeout(resolve, 100))

    const container = containerRef.current
    if (!container) {
      console.warn("⚠️ Container not available for progressive highlighting")
      return
    }

    // Calculate diff using a combined approach
    let diff: Change[]
    const allAdditions = new Set<string>()

    try {
      // Calculate all three types of diffs
      const wordDiff = diffWords(originalText, modifiedText)
      const sentenceDiff = diffSentences(originalText, modifiedText)
      const lineDiff = diffLines(originalText, modifiedText)

      console.log("🔍 All diff types calculated:", {
        wordDiffLength: wordDiff.length,
        sentenceDiffLength: sentenceDiff.length,
        lineDiffLength: lineDiff.length,
        wordAdded: wordDiff.filter((p) => p.added).length,
        sentenceAdded: sentenceDiff.filter((p) => p.added).length,
        lineAdded: lineDiff.filter((p) => p.added).length
      })

      // Combine all diff types for comprehensive highlighting

      // Collect all meaningful additions from each diff type
      const wordAdditions = wordDiff.filter(
        (p) => p.added && p.value.trim().length > 1
      )
      const sentenceAdditions = sentenceDiff.filter(
        (p) => p.added && p.value.trim().length > 3
      )
      const lineAdditions = lineDiff.filter(
        (p) => p.added && p.value.trim().length > 2
      )

      console.log("🔍 Combined diff analysis:", {
        wordAdditions: wordAdditions.length,
        sentenceAdditions: sentenceAdditions.length,
        lineAdditions: lineAdditions.length
      })

      // Merge all additions into a single combined diff result
      diff = [...wordDiff] // Start with word-level as base

      // Add sentence-level additions that aren't already covered by word-level
      for (const sentencePart of sentenceAdditions) {
        const sentenceText = sentencePart.value.trim()
        if (sentenceText && !allAdditions.has(sentenceText)) {
          allAdditions.add(sentenceText)
        }
      }

      // Add line-level additions that aren't already covered
      for (const linePart of lineAdditions) {
        const lineText = linePart.value.trim()
        if (lineText && !allAdditions.has(lineText)) {
          allAdditions.add(lineText)
        }
      }

      // Add word-level additions
      for (const wordPart of wordAdditions) {
        const wordText = wordPart.value.trim()
        if (wordText && !allAdditions.has(wordText)) {
          allAdditions.add(wordText)
        }
      }

      console.log(
        `🎯 Combined highlighting with ${allAdditions.size} unique additions from all levels`
      )

      // Log some sample additions from each type
      const wordSamples = wordAdditions
        .slice(0, 2)
        .map((p) => `"${p.value.trim()}"`)
      const sentenceSamples = sentenceAdditions
        .slice(0, 2)
        .map((p) => `"${p.value.trim()}"`)
      const lineSamples = lineAdditions
        .slice(0, 2)
        .map((p) => `"${p.value.trim()}"`)

      console.log("📝 Sample additions by type:", {
        words: wordSamples,
        sentences: sentenceSamples,
        lines: lineSamples
      })
    } catch (error) {
      console.error("Error calculating diff:", error)
      return
    }

    // Convert our combined additions set to parts for processing
    const addedParts: Array<{ value: string; added: true }> = Array.from(
      allAdditions
    )
      .map((text) => ({
        value: text,
        added: true as const
      }))
      .filter((part) => part.value.length > 2)

    console.log("📊 Progressive diff results:", {
      combinedAdditions: allAdditions.size,
      addedPartsToProcess: addedParts.length
    })

    // If too many highlights, show a warning but still try to highlight (limited)
    if (addedParts.length > 50) {
      console.warn("⚠️ Too many highlights detected, limiting to first 50")
      addedParts.splice(50) // Limit to first 50 highlights
    }

    if (addedParts.length === 0) {
      console.log("✅ No highlights to apply")
      setHighlightProgress(100)
      return
    }

    // Apply highlights progressively using requestAnimationFrame for better performance
    return new Promise<void>((resolve) => {
      let processedCount = 0
      const processedTexts = new Set<string>() // Avoid duplicate highlights

      const processNextBatch = () => {
        const BATCH_SIZE = 2 // Very small batches to avoid blocking
        const batch = addedParts.slice(
          processedCount,
          processedCount + BATCH_SIZE
        )

        // Process this batch
        for (const part of batch) {
          const textToHighlight = part.value.trim()

          // Skip if already processed or too short
          if (
            processedTexts.has(textToHighlight) ||
            textToHighlight.length < 3
          ) {
            continue
          }

          // Skip if text looks like a section title
          if (isSectionTitle(textToHighlight)) {
            console.log("🏷️ Skipping section title:", textToHighlight)
            continue
          }

          processedTexts.add(textToHighlight)

          try {
            // Use an improved text replacement approach that works with all HTML structures
            const contentDiv = container.querySelector(".document-content")
            if (contentDiv) {
              // Multiple strategies for finding and highlighting text
              let highlighted = false

              // Strategy 1: Direct text search (works for simple cases)
              if (!highlighted) {
                highlighted = highlightInTextNodes(contentDiv, textToHighlight)
              }

              // Strategy 2: Flexible text search (handles case differences, extra spaces)
              if (!highlighted) {
                highlighted = highlightFlexibleText(contentDiv, textToHighlight)
              }

              // Strategy 3: Word-by-word search (handles split text across elements)
              if (!highlighted && textToHighlight.includes(" ")) {
                highlighted = highlightWordByWord(contentDiv, textToHighlight)
              }

              // Strategy 4: Partial match search (for very fragmented text)
              if (!highlighted && textToHighlight.length > 5) {
                highlighted = highlightPartialMatches(
                  contentDiv,
                  textToHighlight
                )
              }

              if (!highlighted) {
                console.warn(
                  "🔍 Could not highlight text:",
                  textToHighlight.substring(0, 50)
                )
              }
            }
          } catch (error) {
            console.warn("Error highlighting text:", textToHighlight, error)
          }
        }

        processedCount += batch.length
        const progress = Math.min(
          100,
          Math.round((processedCount / addedParts.length) * 100)
        )
        setHighlightProgress(progress)

        if (processedCount < addedParts.length) {
          // Use requestAnimationFrame for better performance
          requestAnimationFrame(processNextBatch)
        } else {
          // All done
          const endTime = performance.now()
          console.log(
            `✅ Progressive highlighting completed in ${endTime - startTime}ms`
          )
          setHighlightProgress(100)
          resolve()
        }
      }

      // Start processing
      requestAnimationFrame(processNextBatch)
    })
  }

  const injectHighlightsAsync = async (
    originalText: string,
    modifiedText: string,
    modifiedHtml: string
  ): Promise<string> => {
    const startTime = performance.now()
    console.log("🎨 Starting async highlight injection...", {
      originalLength: originalText.length,
      modifiedLength: modifiedText.length,
      htmlLength: modifiedHtml.length
    })

    // Performance check for very large texts
    if (originalText.length > 100000 || modifiedText.length > 100000) {
      console.warn(
        "⚠️ Very large text detected, this may cause performance issues"
      )
    }

    let diff: Change[]

    // Calculate all three types of diffs
    const wordDiff = diffWords(originalText, modifiedText)
    const sentenceDiff = diffSentences(originalText, modifiedText)
    const lineDiff = diffLines(originalText, modifiedText)

    console.log("🔍 Async - All diff types calculated:", {
      wordDiffLength: wordDiff.length,
      sentenceDiffLength: sentenceDiff.length,
      lineDiffLength: lineDiff.length,
      wordAdded: wordDiff.filter((p) => p.added).length,
      sentenceAdded: sentenceDiff.filter((p) => p.added).length,
      lineAdded: lineDiff.filter((p) => p.added).length
    })

    // Smart selection logic based on content analysis
    const wordAddedCount = wordDiff.filter(
      (p) => p.added && p.value.trim().length > 2
    ).length
    const sentenceAddedCount = sentenceDiff.filter(
      (p) => p.added && p.value.trim().length > 5
    ).length
    const lineAddedCount = lineDiff.filter(
      (p) => p.added && p.value.trim().length > 3
    ).length

    let selectedDiff = wordDiff
    let selectedType = "words"

    // Prefer line-level if we have significant line changes
    if (lineAddedCount > 0 && lineAddedCount <= 10) {
      selectedDiff = lineDiff
      selectedType = "lines"
    }
    // Otherwise prefer sentence-level if we have good sentence changes
    else if (sentenceAddedCount > 0 && sentenceAddedCount <= 20) {
      selectedDiff = sentenceDiff
      selectedType = "sentences"
    }
    // Fall back to word-level for precise highlighting
    else if (wordAddedCount > 0) {
      selectedDiff = wordDiff
      selectedType = "words"
    }

    diff = selectedDiff
    console.log(
      `🎯 Async selected ${selectedType} diff with ${
        diff.filter((p) => p.added).length
      } additions`
    )

    console.log("📊 Diff results:", {
      totalParts: diff.length,
      added: diff.filter((part) => part.added).length,
      removed: diff.filter((part) => part.removed).length,
      unchanged: diff.filter((part) => !part.added && !part.removed).length
    })

    let resultHtml = modifiedHtml
    const addedParts = diff.filter((part) => part.added && part.value.trim())

    // Process highlights in batches to avoid blocking the main thread
    const BATCH_SIZE = 5 // Small batches for better responsiveness
    for (let i = 0; i < addedParts.length; i += BATCH_SIZE) {
      const batch = addedParts.slice(i, i + BATCH_SIZE)

      // Process the batch
      batch.forEach((part) => {
        const textToHighlight = part.value.trim()

        // Skip if text looks like a section title
        if (isSectionTitle(textToHighlight)) {
          console.log("🏷️ Async: Skipping section title:", textToHighlight)
          return
        }

        // Escape special regex characters
        const escapedText = textToHighlight.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        )

        // Simple but effective approach: replace the text anywhere it appears
        const regex = new RegExp(`\\b${escapedText}\\b`, "gi")

        resultHtml = resultHtml.replace(
          regex,
          `<mark class="diff-highlight-added" style="background-color: rgba(34, 197, 94, 0.15); padding: 1px 3px; border-radius: 2px; border-left: 3px solid rgba(34, 197, 94, 0.6); color: #333;" title="Added: ${textToHighlight}">${textToHighlight}</mark>`
        )
      })

      // Yield control back to the browser between batches
      if (i + BATCH_SIZE < addedParts.length) {
        await new Promise((resolve) => setTimeout(resolve, 0))
        console.log(
          `🔄 Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
            addedParts.length / BATCH_SIZE
          )}`
        )
      }
    }

    const endTime = performance.now()
    console.log(
      `✅ Async highlight injection completed in ${endTime - startTime}ms`
    )
    return resultHtml
  }

  const injectHighlights = (
    originalText: string,
    modifiedText: string,
    modifiedHtml: string
  ): string => {
    const startTime = performance.now()
    console.log("🎨 Starting highlight injection...", {
      originalLength: originalText.length,
      modifiedLength: modifiedText.length,
      htmlLength: modifiedHtml.length
    })

    // Performance check for very large texts
    if (originalText.length > 100000 || modifiedText.length > 100000) {
      console.warn(
        "⚠️ Very large text detected, this may cause performance issues"
      )
      // Could implement a fallback or chunking strategy here
    }

    let diff: Change[]

    // Calculate all three types of diffs
    const wordDiff = diffWords(originalText, modifiedText)
    const sentenceDiff = diffSentences(originalText, modifiedText)
    const lineDiff = diffLines(originalText, modifiedText)

    console.log("🔍 Sync - All diff types calculated:", {
      wordDiffLength: wordDiff.length,
      sentenceDiffLength: sentenceDiff.length,
      lineDiffLength: lineDiff.length,
      wordAdded: wordDiff.filter((p) => p.added).length,
      sentenceAdded: sentenceDiff.filter((p) => p.added).length,
      lineAdded: lineDiff.filter((p) => p.added).length
    })

    // Smart selection logic based on content analysis
    const wordAddedCount = wordDiff.filter(
      (p) => p.added && p.value.trim().length > 2
    ).length
    const sentenceAddedCount = sentenceDiff.filter(
      (p) => p.added && p.value.trim().length > 5
    ).length
    const lineAddedCount = lineDiff.filter(
      (p) => p.added && p.value.trim().length > 3
    ).length

    let selectedDiff = wordDiff
    let selectedType = "words"

    // Prefer line-level if we have significant line changes
    if (lineAddedCount > 0 && lineAddedCount <= 10) {
      selectedDiff = lineDiff
      selectedType = "lines"
    }
    // Otherwise prefer sentence-level if we have good sentence changes
    else if (sentenceAddedCount > 0 && sentenceAddedCount <= 20) {
      selectedDiff = sentenceDiff
      selectedType = "sentences"
    }
    // Fall back to word-level for precise highlighting
    else if (wordAddedCount > 0) {
      selectedDiff = wordDiff
      selectedType = "words"
    }

    diff = selectedDiff
    console.log(
      `🎯 Sync selected ${selectedType} diff with ${
        diff.filter((p) => p.added).length
      } additions`
    )

    console.log("📊 Diff results:", {
      totalParts: diff.length,
      added: diff.filter((part) => part.added).length,
      removed: diff.filter((part) => part.removed).length,
      unchanged: diff.filter((part) => !part.added && !part.removed).length
    })

    let resultHtml = modifiedHtml

    // Process each added part and highlight it
    diff.forEach((part, index) => {
      if (part.added && part.value.trim()) {
        const textToHighlight = part.value.trim()

        // Skip if text looks like a section title
        if (isSectionTitle(textToHighlight)) {
          console.log("🏷️ Sync: Skipping section title:", textToHighlight)
          return
        }

        // Escape special regex characters
        const escapedText = textToHighlight.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        )

        // Simple but effective approach: replace the text anywhere it appears
        const regex = new RegExp(`\\b${escapedText}\\b`, "gi")

        resultHtml = resultHtml.replace(
          regex,
          `<mark class="diff-highlight-added" style="background-color: rgba(34, 197, 94, 0.15); padding: 1px 3px; border-radius: 2px; border-left: 3px solid rgba(34, 197, 94, 0.6); color: #333;" title="Added: ${textToHighlight}">${textToHighlight}</mark>`
        )
      }
    })

    const endTime = performance.now()
    console.log(`✅ Highlight injection completed in ${endTime - startTime}ms`)
    return resultHtml
  }

  // Helper functions for different highlighting strategies
  const createHighlightElement = (text: string): HTMLElement => {
    const highlightSpan = document.createElement("mark")
    highlightSpan.className = "diff-highlight-added"
    highlightSpan.style.cssText =
      "background-color: rgba(34, 197, 94, 0.15); padding: 1px 3px; border-radius: 2px; border-left: 3px solid rgba(34, 197, 94, 0.6); color: #333;"
    highlightSpan.textContent = text
    return highlightSpan
  }

  const highlightInTextNodes = (
    container: Element,
    textToHighlight: string
  ): boolean => {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        // Skip if already inside a highlight
        const parent = node.parentElement
        if (!parent) return NodeFilter.FILTER_REJECT

        // Skip if inside a link (anchor tag)
        if (parent.closest("a")) return NodeFilter.FILTER_REJECT

        // Skip if inside heading elements (section titles)
        if (parent.closest("h1, h2, h3, h4, h5, h6"))
          return NodeFilter.FILTER_REJECT

        // Skip if inside elements with section title classes or styles
        if (parent.closest(".section-title, .heading, .header, .title"))
          return NodeFilter.FILTER_REJECT

        // Skip if already highlighted
        if (parent.closest(".diff-highlight-added"))
          return NodeFilter.FILTER_REJECT

        return NodeFilter.FILTER_ACCEPT
      }
    })

    const textNodes: Text[] = []
    let node
    while ((node = walker.nextNode())) {
      if (node.textContent && node.textContent.includes(textToHighlight)) {
        textNodes.push(node as Text)
      }
    }

    // Highlight in the first matching text node only
    if (textNodes.length > 0) {
      const textNode = textNodes[0]
      const text = textNode.textContent || ""
      const highlightIndex = text.indexOf(textToHighlight)

      if (highlightIndex !== -1) {
        const parent = textNode.parentNode as HTMLElement
        if (parent) {
          const beforeText = text.substring(0, highlightIndex)
          const afterText = text.substring(
            highlightIndex + textToHighlight.length
          )

          const highlightSpan = createHighlightElement(textToHighlight)

          // Replace the text node with before + highlight + after
          if (beforeText) {
            parent.insertBefore(document.createTextNode(beforeText), textNode)
          }
          parent.insertBefore(highlightSpan, textNode)
          if (afterText) {
            parent.insertBefore(document.createTextNode(afterText), textNode)
          }
          parent.removeChild(textNode)
          return true
        }
      }
    }
    return false
  }

  const highlightFlexibleText = (
    container: Element,
    textToHighlight: string
  ): boolean => {
    // Normalize text for flexible matching
    const normalizeText = (text: string) =>
      text.toLowerCase().replace(/\s+/g, " ").trim()

    const normalizedTarget = normalizeText(textToHighlight)

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement
        if (!parent) return NodeFilter.FILTER_REJECT

        // Skip if inside a link (anchor tag)
        if (parent.closest("a")) return NodeFilter.FILTER_REJECT

        // Skip if inside heading elements (section titles)
        if (parent.closest("h1, h2, h3, h4, h5, h6"))
          return NodeFilter.FILTER_REJECT

        // Skip if inside elements with section title classes or styles
        if (parent.closest(".section-title, .heading, .header, .title"))
          return NodeFilter.FILTER_REJECT

        // Skip if already highlighted
        if (parent.closest(".diff-highlight-added"))
          return NodeFilter.FILTER_REJECT

        return NodeFilter.FILTER_ACCEPT
      }
    })

    let node
    while ((node = walker.nextNode())) {
      const text = node.textContent || ""
      const normalizedText = normalizeText(text)

      if (normalizedText.includes(normalizedTarget)) {
        // Find the actual position in the original text
        const lowerText = text.toLowerCase()
        const lowerTarget = textToHighlight.toLowerCase()
        const startIndex = lowerText.indexOf(lowerTarget)

        if (startIndex !== -1) {
          const parent = node.parentNode as HTMLElement
          if (parent) {
            const beforeText = text.substring(0, startIndex)
            const matchedText = text.substring(
              startIndex,
              startIndex + textToHighlight.length
            )
            const afterText = text.substring(
              startIndex + textToHighlight.length
            )

            const highlightSpan = createHighlightElement(matchedText)

            if (beforeText) {
              parent.insertBefore(document.createTextNode(beforeText), node)
            }
            parent.insertBefore(highlightSpan, node)
            if (afterText) {
              parent.insertBefore(document.createTextNode(afterText), node)
            }
            parent.removeChild(node)
            return true
          }
        }
      }
    }
    return false
  }

  const highlightWordByWord = (
    container: Element,
    textToHighlight: string
  ): boolean => {
    const words = textToHighlight.split(/\s+/).filter((word) => word.length > 2)
    let highlightedAny = false

    for (const word of words) {
      if (highlightInTextNodes(container, word)) {
        highlightedAny = true
      }
    }

    return highlightedAny
  }

  const highlightPartialMatches = (
    container: Element,
    textToHighlight: string
  ): boolean => {
    // Try to highlight parts of the text if the whole thing doesn't match
    const parts = [
      textToHighlight.substring(0, Math.ceil(textToHighlight.length / 2)),
      textToHighlight.substring(Math.floor(textToHighlight.length / 2))
    ].filter((part) => part.trim().length > 3)

    let highlightedAny = false

    for (const part of parts) {
      if (
        highlightInTextNodes(container, part.trim()) ||
        highlightFlexibleText(container, part.trim())
      ) {
        highlightedAny = true
      }
    }

    return highlightedAny
  }

  // Helper function to detect if text looks like a section title
  const isSectionTitle = (text: string): boolean => {
    if (!text || text.length < 3) return false

    const trimmedText = text.trim().toUpperCase()

    // Common section titles in resumes
    const sectionTitles = [
      "PROFESSIONAL SUMMARY",
      "CORE COMPETENCIES",
      "PROFESSIONAL EXPERIENCE",
      "WORK EXPERIENCE",
      "EXPERIENCE",
      "EDUCATION",
      "LANGUAGES",
      "AWARDS & HONORS",
      "AWARDS AND HONORS",
      "HONORS & AWARDS",
      "HONORS AND AWARDS",
      "SKILLS",
      "TECHNICAL SKILLS",
      "CERTIFICATIONS",
      "CERTIFICATES",
      "PROJECTS",
      "KEY PROJECTS",
      "PUBLICATIONS",
      "VOLUNTEER EXPERIENCE",
      "ADDITIONAL INFORMATION",
      "REFERENCES",
      "CONTACT",
      "CONTACT INFORMATION",
      "OBJECTIVE",
      "CAREER OBJECTIVE",
      "SUMMARY",
      "PROFILE",
      "QUALIFICATIONS",
      "ACHIEVEMENTS",
      "ACCOMPLISHMENTS"
    ]

    // Check if text matches any known section title
    if (sectionTitles.includes(trimmedText)) return true

    // Check if text looks like a section title (all caps, short, common patterns)
    if (
      trimmedText.length <= 30 &&
      trimmedText === trimmedText.toUpperCase() &&
      /^[A-Z\s&]+$/.test(trimmedText)
    ) {
      return true
    }

    return false
  }

  // Minimal styles that only add highlighting - let docx-wrapper handle everything else
  const getDocumentStyles = () => `
    <style>
      /* Only highlight styles - inherit everything else from docx-wrapper CSS */
      .diff-highlight-added {
        background-color: rgba(34, 197, 94, 0.15) !important;
        padding: 1px 3px !important;
        border-radius: 2px !important;
        border-left: 3px solid rgba(34, 197, 94, 0.6) !important;
        border-top: none !important;
        border-right: none !important;
        border-bottom: none !important;
        color: inherit !important;
        position: relative !important;
        display: inline !important;
      }
      
      .diff-highlight-added:hover {
        background-color: rgba(34, 197, 94, 0.25) !important;
      }
    </style>
  `

  if (isProcessing) {
    return (
      <div
        className={`flex items-center justify-center h-64 bg-white rounded-lg ${className}`}>
        <div className="flex items-center gap-3 text-gray-600">
          <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full"></div>
          <span>Processing documents and generating highlights...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center h-64 bg-white rounded-lg border border-red-200 ${className}`}>
        <div className="text-center text-red-600">
          <div className="text-lg font-semibold mb-2">
            Error Processing Documents
          </div>
          <div className="text-sm">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (isProcessing) {
    return (
      <div
        className={`flex items-center justify-center h-64 bg-white rounded-lg ${className}`}>
        <div className="flex items-center gap-3 text-gray-600">
          <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full"></div>
          <span>Processing documents...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center h-64 bg-white rounded-lg border border-red-200 ${className}`}>
        <div className="text-center text-red-600">
          <div className="text-lg font-semibold mb-2">
            Error Processing Documents
          </div>
          <div className="text-sm">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!baseHtml) {
    return (
      <div
        className={`flex items-center justify-center h-64 bg-white rounded-lg ${className}`}>
        <div className="text-gray-500">No content to display</div>
      </div>
    )
  }

  return (
    <div
      className={`docx-wrapper w-full h-full overflow-auto bg-white p-4 ${className}`}>
      {/* Document Content - using exact same structure as docx-preview */}
      <div ref={containerRef} className="docx-content w-full h-full">
        <div
          className="document-content"
          dangerouslySetInnerHTML={{
            __html: getDocumentStyles() + baseHtml
          }}
        />
      </div>
    </div>
  )
}

export default DocxDiffHighlighter
