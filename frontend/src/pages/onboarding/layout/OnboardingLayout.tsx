import React from "react"

const FormCardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative w-full min-h-screen flex bg-brand-bgBlue-form rounded-2xl shadow-2xl border border-black z-50">
      {/* Background Image */}

      {/* Foreground Content */}
      <div className=" text-white relative z-10 w-full h-full overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

export default FormCardLayout
