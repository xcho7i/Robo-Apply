import React from "react"

const FormPara = ({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <p
      className={`text-white text-sm sm:text-base leading-relaxed ${className}`}>
      {children}
    </p>
  )
}

export default FormPara
