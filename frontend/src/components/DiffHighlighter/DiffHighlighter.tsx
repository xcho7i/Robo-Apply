import React from "react"
import { diffWords, diffLines, diffSentences, Change } from "diff"
import "./DiffHighlighter.css"

interface DiffHighlighterProps {
  originalText: string
  modifiedText: string
  className?: string
  showOnlyChanges?: boolean
}

const DiffHighlighter: React.FC<DiffHighlighterProps> = ({
  originalText,
  modifiedText,
  className = "",
  showOnlyChanges = false
}) => {
  // Use simple word diff for debugging
  const diff = diffWords(originalText, modifiedText)

  const renderDiffPart = (part: Change, index: number) => {
    if (part.added) {
      return (
        <span key={index} className="diff-added" title="Added content">
          {part.value}
        </span>
      )
    }

    if (part.removed) {
      // Don't render removed content when showing only changes
      if (showOnlyChanges) {
        return null
      }
      return (
        <span key={index} className="diff-removed" title="Removed content">
          {part.value}
        </span>
      )
    }

    // For unchanged content, always show it (it's the base text)
    return (
      <span key={index} className="diff-unchanged">
        {part.value}
      </span>
    )
  }

  return (
    <div className={`diff-highlighter ${className}`}>
      <div className="diff-legend">
        <div className="diff-legend-item">
          <div className="diff-legend-color legend-added"></div>
          <span style={{ color: "#374151" }}>Added</span>
        </div>
        {!showOnlyChanges && (
          <div className="diff-legend-item">
            <div className="diff-legend-color legend-removed"></div>
            <span style={{ color: "#374151" }}>Removed</span>
          </div>
        )}
        <div className="diff-legend-item">
          <div className="diff-legend-color legend-unchanged"></div>
          <span style={{ color: "#374151" }}>Unchanged</span>
        </div>
      </div>

      <div className="diff-content">
        <div className="whitespace-pre-wrap">
          {diff.map((part, index) => renderDiffPart(part, index))}
        </div>
      </div>
    </div>
  )
}

export default DiffHighlighter
