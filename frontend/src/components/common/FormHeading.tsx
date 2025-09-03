import React from "react"

const FormHeading = ({
  whiteText,
  yellowText,
  purpleText,
  className
}: {
  whiteText?: string
  yellowText?: string
  purpleText?: string
  className?: string
}) => {
  return (
    <h1
      className={`text-white text-2xl md:text-3xl lg:text-4xl font-semibold text-center leading-tight ${className}`}>
      {whiteText}
      {yellowText && <span className="text-brand-yellow"> {yellowText}</span>}
      {purpleText && <span className="text-brand-purple"> {purpleText} </span>}
    </h1>
  )
}

export default FormHeading
