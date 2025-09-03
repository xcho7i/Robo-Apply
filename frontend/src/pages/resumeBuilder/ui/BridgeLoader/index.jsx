import React from "react"
import "./Loader.css"

const ElegantLoader = ({ height }) => {
  // Use the passed height prop or fallback to h-40
  const heightClass = height || "h-40"
  
  return (
    <div className={`relative w-full ${heightClass} bg-dropdownBackground rounded-md shadow-sm overflow-hidden`}>
      {/* Dashed animated line */}
      <div className="absolute top-0 left-0 w-full h-[2px] animate-dash-gradient bg-[length:20px_2px] bg-repeat-x bg-gradient-to-r from-[#c7bff5] via-transparent to-[#c7bff5]" />

      {/* Spinner dot in the center */}
      <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
        <div className="w-4 h-4 bg-[#a58ef5] rounded-full animate-ping-slow" />
      </div>

      {/* Floating bubbles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => {
          const size = 6 + Math.random() * 8
          return (
            <div
              key={i}
              className="absolute bg-[#e4ddfb] rounded-full blur-sm opacity-40 animate-bubble"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${Math.random() * 100}%`,
                bottom: `${Math.random() * 20}px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          )
        })}
      </div>

      {/* Generating + Round Spinning Gear */}
      <div className="absolute inset-0 flex items-center justify-center text-[#a58ef5] text-lg font-medium">
        <span>Generating</span>
        <svg
          className="w-5 h-5 animate-spin text-[#a58ef5]"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2a1 1 0 0 1 .993.883L13 3v1.07a7.001 7.001 0 0 1 4.243 1.757l.758-.758a1 1 0 0 1 1.497 1.32l-.083.094-.758.758A7.001 7.001 0 0 1 19.93 11H21a1 1 0 0 1 .117 1.993L21 13h-1.07a7.001 7.001 0 0 1-1.757 4.243l.758.758a1 1 0 0 1-1.32 1.497l-.094-.083-.758-.758A7.001 7.001 0 0 1 13 19.93V21a1 1 0 0 1-1.993.117L11 21v-1.07a7.001 7.001 0 0 1-4.243-1.757l-.758.758a1 1 0 0 1-1.497-1.32l.083-.094.758-.758A7.001 7.001 0 0 1 4.07 13H3a1 1 0 0 1-.117-1.993L3 11h1.07a7.001 7.001 0 0 1 1.757-4.243l-.758-.758a1 1 0 0 1 1.32-1.497l.094.083.758.758A7.001 7.001 0 0 1 11 4.07V3a1 1 0 0 1 1-1zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
        </svg>
      </div>
    </div>
  )
}

export default ElegantLoader
