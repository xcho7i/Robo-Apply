import React from "react"

const CreativeTemplate = ({ content }) => {
  const lines = content.split("\n")
  const headerLines = lines.slice(0, 6)
  const recipientLines = lines.slice(7, 11)
  const bodyLines = lines.slice(12)

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 shadow-lg max-w-4xl mx-auto rounded-lg">
      {/* Header with accent */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg -mt-8 -mx-8 mb-6">
        <div className="text-right space-y-1">
          {headerLines.map((line, index) => (
            <p key={index} className="text-sm font-light">
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Recipient */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        {recipientLines.map((line, index) => (
          <p key={index} className="text-sm text-gray-700 font-medium">
            {line}
          </p>
        ))}
      </div>

      {/* Body */}
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
        {bodyLines.map((line, index) => (
          <p key={index} className="text-sm text-gray-800 leading-relaxed">
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}

export default CreativeTemplate
