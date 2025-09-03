import { useNavigate } from "react-router-dom"

export default function ExpiredModal({ open, onClose }) {
  const navigate = useNavigate()

  if (!open) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-[#1C1C1E] text-center text-white rounded-2xl p-8 max-w-md shadow-lg">
        <h2 className="text-2xl md:text-4xl font-bold">
          Your Access Has Expired
        </h2>
        <p className="text-gray-400 mt-3 text-sm">
          Upgrade now to continue applying to jobs, saving resumes, and tracking
          your progress.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          {/* <button
            className="bg-[#6D4AFF] hover:bg-[#5a3de0] text-white py-3 px-6 text-base rounded-xl"
            onClick={() => alert("Reactivate clicked")}>
            Reactivate My Plan
          </button> */}
          <button
            className=" bg-gradient-to-b rounded-full p-3 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd"
            onClick={() => {
              navigate("/pricingPlan") // redirect
            }}>
            View Plans & Pricing
          </button>
          <button
            className="mt-2 text-red-400 text-sm hidden"
            onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
