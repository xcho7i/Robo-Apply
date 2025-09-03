import React from "react"

const TemplateCard = ({ templateStyle, isActive, onClick }) => {
  const getPreviewStyle = () => {
    switch (templateStyle.style) {
      case "classic":
        return "bg-white border-2 border-gray-300"
      case "modern":
        return "bg-gradient-to-b from-white to-gray-50 border border-gray-200"
      case "creative":
        return "bg-gradient-to-br from-purple-100 to-blue-100 border border-purple-300"
      case "executive":
        return "bg-white border-t-4 border-gray-800 border-l border-r border-b"
      default:
        return "bg-white border border-gray-200"
    }
  }

  return (
    <div
      className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
        isActive ? "ring-2 ring-simplePurple" : ""
      }`}
      onClick={onClick}>
      <div
        className={`rounded-lg shadow-lg p-4 h-48 overflow-hidden ${
          isActive ? "ring-2 ring-simplePurple" : ""
        }`}>
        <h3
          className={`text-lg font-semibold mb-2 ${
            isActive ? "text-primary" : "text-gray-800"
          }`}>
          {templateStyle.name}
        </h3>
        <p className="text-xs text-gray-600 mb-3">
          {templateStyle.description}
        </p>

        {/* Mini preview */}
        <div
          className={`${getPreviewStyle()} h-24 rounded p-2 text-xs overflow-hidden`}>
          <div className="space-y-1">
            <div className="h-1 bg-gray-400 rounded w-3/4"></div>
            <div className="h-1 bg-gray-400 rounded w-1/2"></div>
            <div className="h-1 bg-gray-400 rounded w-2/3"></div>
            <div className="h-1 bg-gray-300 rounded w-full mt-2"></div>
            <div className="h-1 bg-gray-300 rounded w-5/6"></div>
            <div className="h-1 bg-gray-300 rounded w-4/5"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TemplateCard
