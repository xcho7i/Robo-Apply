import React from "react"
import { diffWords, diffLines, diffSentences, Change } from "diff"
import "./DiffHighlighter.css"

interface AdvancedDiffHighlighterProps {
  originalText: string
  modifiedText: string
  className?: string
  showOnlyChanges?: boolean
  highlightLevel?: "subtle" | "normal" | "strong"
}

const AdvancedDiffHighlighter: React.FC<AdvancedDiffHighlighterProps> = ({
  originalText,
  modifiedText,
  className = "",
  showOnlyChanges = false,
  highlightLevel = "normal"
}) => {
  const getDiff = (): Change[] => {
    // Calculate all three types of diffs for smart selection
    const wordDiff = diffWords(originalText, modifiedText)
    const sentenceDiff = diffSentences(originalText, modifiedText)
    const lineDiff = diffLines(originalText, modifiedText)

    console.log("🔍 AdvancedDiffHighlighter - All diff types calculated:", {
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

    for (const diff of allDiffs) {
      for (const part of diff) {
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
    if (!showOnlyChanges) {
      for (const part of wordDiff) {
        if (part.removed) {
          combinedDiff.push(part)
        }
      }
    }

    console.log(
      `🎯 AdvancedDiffHighlighter created combined diff with ${
        combinedDiff.filter((p) => p.added).length
      } unique additions from all levels`
    )
    return combinedDiff
  }

  const diff = getDiff()

  const getHighlightClasses = (type: "added" | "removed" | "unchanged") => {
    // Always use inline for better flow since we're using combined mode
    const baseClasses = "inline"
    const levelClasses = {
      subtle: {
        added: "bg-green-100/50 text-gray-800 border-l border-green-600",
        removed:
          "bg-red-100/50 text-gray-600 line-through border-l border-red-600",
        unchanged: "text-gray-700"
      },
      normal: {
        added: "bg-green-100/70 text-gray-800 border-l-2 border-green-400 pl-2",
        removed:
          "bg-red-100/70 text-gray-600 line-through border-l-2 border-red-400 pl-2",
        unchanged: "text-gray-700"
      },
      strong: {
        added:
          "bg-green-100 text-gray-900 border-l-4 border-green-300 pl-3 font-medium",
        removed:
          "bg-red-100 text-gray-600 line-through border-l-4 border-red-300 pl-3 font-medium",
        unchanged: "text-gray-700"
      }
    }

    return `${baseClasses} ${levelClasses[highlightLevel][type]}`
  }

  const renderDiffPart = (part: Change, index: number) => {
    if (part.added) {
      return (
        <span
          key={index}
          className={getHighlightClasses("added")}
          title="Added content">
          {part.value}
        </span>
      )
    }

    if (part.removed) {
      if (showOnlyChanges) {
        return null
      }
      return (
        <span
          key={index}
          className={getHighlightClasses("removed")}
          title="Removed content">
          {part.value}
        </span>
      )
    }

    return (
      <span key={index} className={getHighlightClasses("unchanged")}>
        {part.value}
      </span>
    )
  }

  const getStatistics = () => {
    const added = diff.filter((part) => part.added).length
    const removed = diff.filter((part) => part.removed).length
    const unchanged = diff.filter((part) => !part.added && !part.removed).length

    return { added, removed, unchanged, total: added + removed + unchanged }
  }

  const stats = getStatistics()

  return (
    <div className={`diff-highlighter ${className}`}>
      {/* Statistics Bar */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">Change Summary</h4>
          <div className="text-xs text-gray-600">
            {stats.total} total changes
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-400 rounded"></div>
            <span className="text-gray-700">{stats.added} added</span>
          </div>
          {!showOnlyChanges && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-100 border border-red-400 rounded"></div>
              <span className="text-gray-700">{stats.removed} removed</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-100 border border-gray-500 rounded"></div>
            <span className="text-gray-700">{stats.unchanged} unchanged</span>
          </div>
        </div>
      </div>

      {/* Diff Content */}
      <div className="diff-content">
        <pre className="whitespace-pre-wrap">
          {diff.map((part, index) => renderDiffPart(part, index))}
        </pre>
      </div>
    </div>
  )
}

export default AdvancedDiffHighlighter
