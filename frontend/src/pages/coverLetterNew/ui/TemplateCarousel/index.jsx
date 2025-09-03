import React, { useState } from "react"
import TemplateCard from "../TemplateCard"
import TemplatePreview from "../TemplatePreview"

// Template styles data
const templateStyles = [
  {
    id: 1,
    name: "Classic Professional",
    description: "Traditional business letter format",
    style: "classic"
  },
  {
    id: 2,
    name: "Modern Minimal",
    description: "Clean, minimal design with emphasis on readability",
    style: "modern"
  },
  {
    id: 3,
    name: "Creative Bold",
    description: "Eye-catching design with color accents",
    style: "creative"
  },
  {
    id: 4,
    name: "Executive Formal",
    description: "Sophisticated layout for senior positions",
    style: "executive"
  }
]

const TemplateCarousel = ({ content }) => {
  const [activeTemplate, setActiveTemplate] = useState(0)

  const handleTemplateChange = (index) => {
    setActiveTemplate(index)
  }

  const handlePrevious = () => {
    setActiveTemplate((prev) =>
      prev === 0 ? templateStyles.length - 1 : prev - 1
    )
  }

  const handleNext = () => {
    setActiveTemplate((prev) =>
      prev === templateStyles.length - 1 ? 0 : prev + 1
    )
  }

  return (
    <div className="px-4 md:px-8 mb-8">
      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrevious}
          className="bg-simplePurple text-white p-2 rounded-full hover:bg-purple-700 transition-colors">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="text-white">
          {activeTemplate + 1} of {templateStyles.length}
        </div>
        <button
          onClick={handleNext}
          className="bg-simplePurple text-white p-2 rounded-full hover:bg-purple-700 transition-colors">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Template Style Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {templateStyles.map((templateStyle, index) => (
          <TemplateCard
            key={templateStyle.id}
            templateStyle={templateStyle}
            isActive={index === activeTemplate}
            onClick={() => handleTemplateChange(index)}
          />
        ))}
      </div>

      {/* Template Preview */}
      <div className="bg-gray-800 rounded-lg p-5">
        <TemplatePreview
          templateStyle={templateStyles[activeTemplate]}
          content={content}
        />
      </div>
    </div>
  )
}

export default TemplateCarousel
