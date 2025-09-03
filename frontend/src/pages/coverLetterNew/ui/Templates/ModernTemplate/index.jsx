import React from "react"

const ModernTemplate = ({ content }) => {
  const lines = content.split("\n")
  const headerLines = lines.slice(0, 6)
  const recipientLines = lines.slice(7, 11)
  const bodyLines = lines.slice(12)

  return (
    <div
      className="bg-white p-8 shadow-lg max-w-4xl mx-auto"
      style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div className="border-b-2 border-gray-200 pb-4 mb-6">
        <div className="text-right space-y-1">
          {headerLines.map((line, index) => (
            <p key={index} className="text-sm text-gray-600 font-light">
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Recipient */}
      <div className="mb-6">
        {recipientLines.map((line, index) => (
          <p key={index} className="text-sm text-gray-700 font-medium">
            {line}
          </p>
        ))}
      </div>

      {/* Body */}
      <div className="space-y-4">
        {bodyLines.map((line, index) => (
          <p key={index} className="text-sm text-gray-800 leading-relaxed">
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}

export default ModernTemplate
