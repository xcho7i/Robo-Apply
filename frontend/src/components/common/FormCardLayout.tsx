import React from "react"

const FormCardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative overflow-hidden min-h-[80dvh] md:min-h-full h-full w-full flex items-center justify-center bg-brand-bgBlue-form rounded-2xl shadow-2xl  border-black border !z-50">
      {children}
    </div>
  )
}

export default FormCardLayout
