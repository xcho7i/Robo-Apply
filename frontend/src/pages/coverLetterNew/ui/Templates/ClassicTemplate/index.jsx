import React from "react"

const ClassicTemplate = ({ content }) => {
  return (
    <div
      className="bg-white p-8 shadow-lg max-w-4xl mx-auto"
      style={{ fontFamily: "Times New Roman, serif" }}>
      <div className="space-y-4">
        <pre className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-serif">
          {content}
        </pre>
      </div>
    </div>
  )
}

export default ClassicTemplate
