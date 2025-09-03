import React from "react"

const ExecutiveTemplate = ({ content }) => {
  const lines = content.split("\n")
  const headerLines = lines.slice(0, 6)
  const recipientLines = lines.slice(7, 11)
  const bodyLines = lines.slice(12)

  return (
    <div className="bg-white p-10 shadow-xl max-w-4xl mx-auto border-t-4 border-gray-800">
      {/* Header */}
      <div className="text-center mb-8 pb-6 border-b border-gray-300">
        <div className="space-y-2">
          {headerLines.map((line, index) => (
            <p
              key={index}
              className={`${
                index === 0
                  ? "text-xl font-bold text-gray-800"
                  : "text-sm text-gray-600"
              }`}>
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Recipient */}
      <div className="mb-8">
        {recipientLines.map((line, index) => (
          <p
            key={index}
            className="text-sm text-gray-700 font-medium leading-relaxed">
            {line}
          </p>
        ))}
      </div>

      {/* Body */}
      <div className="space-y-5">
        {bodyLines.map((line, index) => (
          <p
            key={index}
            className="text-sm text-gray-800 leading-relaxed text-justify">
            {line}
          </p>
        ))}
      </div>

      {/* Footer accent */}
      <div className="mt-8 pt-4 border-t border-gray-300">
        <div className="h-2 bg-gradient-to-r from-gray-800 to-gray-600 rounded"></div>
      </div>
    </div>
  )
}

export default ExecutiveTemplate
