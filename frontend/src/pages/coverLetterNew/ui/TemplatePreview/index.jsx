import React from "react"
import ClassicTemplate from "../Templates/ClassicTemplate"
import ModernTemplate from "../Templates/ModernTemplate"
import CreativeTemplate from "../Templates/CreativeTemplate"
import ExecutiveTemplate from "../Templates/ExecutiveTemplate"

const TemplatePreview = ({ templateStyle, content }) => {
  const renderTemplate = () => {
    switch (templateStyle.style) {
      case "classic":
        return <ClassicTemplate content={content} />
      case "modern":
        return <ModernTemplate content={content} />
      case "creative":
        return <CreativeTemplate content={content} />
      case "executive":
        return <ExecutiveTemplate content={content} />
      default:
        return <ClassicTemplate content={content} />
    }
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {templateStyle.name}
          </h2>
          <p className="text-gray-300 text-sm">{templateStyle.description}</p>
        </div>
      </div>
      <div className="bg-gray-100 rounded-lg p-6 ">{renderTemplate()}</div>
    </div>
  )
}

export default TemplatePreview
