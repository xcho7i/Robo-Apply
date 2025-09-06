import { useNavigate } from "react-router-dom"

export default function ExpiredModal({ open, onClose }) {
  const navigate = useNavigate()

  if (!open) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-[#1C1C1E] text-center text-white rounded-2xl p-8 min-w-[30%] space-y-2 max-w-lg min-h-[30%] shadow-lg flex flex-col justify-between">
        {/* Title */}
        <h2 className="text-2xl md:text-4xl font-bold">
          Your Access Has Expired
        </h2>

        {/* Message */}
        <p className="text-gray-400 text-sm">
          Upgrade now to continue applying to jobs, saving resumes, and tracking
          your progress.
        </p>

        {/* Button Section */}
        <div className="flex flex-col gap-3">
          <button
            className="bg-gradient-to-b rounded-full p-3 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd"
            onClick={() => navigate("/pricingPlan")}>
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
