// import { AlertTriangle } from "lucide-react"
// import API_ENDPOINTS from "../../../api/endpoints"

// const BASE_URL =
//   import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

// export default function PaymentFailed({ open, onClose }) {
//   if (!open) return null

//   const handleTryAgain = async () => {
//     try {
//       const token = localStorage.getItem("access_token") // or however you store it

//       const res = await fetch(
//         `${BASE_URL}${API_ENDPOINTS.CreateCustomerPortalSession}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`
//           }
//         }
//       )

//       const data = await res.json()

//       if (data.success && data.portalUrl) {
//         // ✅ success: redirect (modal won't matter anymore)
//         window.location.href = data.portalUrl
//       } else {
//         // ❌ failure: keep modal open
//         console.error("Failed to create session:", data.msg)
//       }
//     } catch (err) {
//       console.error("Error creating portal session:", err)
//       // ❌ also keep modal open on error
//     }
//   }

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
//       <div className="bg-[#1C1C1E] text-center text-white rounded-2xl p-8 min-w-[30%] min-h-[30%] shadow-lg flex flex-col">
//         {/* Icon */}
//         <div className="flex justify-center mb-4">
//           <AlertTriangle className="w-12 h-12 text-yellow" />
//         </div>

//         {/* Title + message */}
//         <h2 className="text-2xl md:text-4xl font-bold">Payment Failed</h2>
//         <p className="text-gray-400 mt-3 mb-4 text-sm">
//           There was an issue processing your payment. Please try again.
//         </p>

//         {/* Button */}
//         <div className="mt-auto flex justify-center">
//           <button
//             className="bg-[#6D4AFF] w-full hover:bg-[#5a3de0] text-white py-3 px-6 text-base rounded-xl"
//             onClick={handleTryAgain}>
//             Try Again
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

import { AlertTriangle, X } from "lucide-react"
import API_ENDPOINTS from "../../../api/endpoints"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

export default function PaymentFailed({ open, onClose }) {
  if (!open) return null

  const handleTryAgain = async () => {
    try {
      const token = localStorage.getItem("access_token") // or however you store it

      const res = await fetch(
        `${BASE_URL}${API_ENDPOINTS.CreateCustomerPortalSession}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await res.json()

      if (data.success && data.portalUrl) {
        // ✅ success: redirect (modal won't matter anymore)
        window.location.href = data.portalUrl
      } else {
        // ❌ failure: keep modal open
        console.error("Failed to create session:", data.msg)
      }
    } catch (err) {
      console.error("Error creating portal session:", err)
      // ❌ also keep modal open on error
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-[#1C1C1E] text-center text-white rounded-2xl p-8 min-w-[30%] min-h-[30%] shadow-lg flex flex-col relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded-full hover:bg-gray-700"
          aria-label="Close modal">
          <X className="w-6 h-6" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4 mt-2">
          <AlertTriangle className="w-14 h-14 text-yellow" />
        </div>

        {/* Title + message */}
        <h2 className="text-2xl md:text-4xl font-bold">Payment Failed</h2>
        <p className="text-gray-400 mt-3 mb-4 text-sm">
          There was an issue processing your payment. Please try again.
        </p>

        {/* Button */}
        <div className="mt-auto flex justify-center">
          <button
            className="bg-[#6D4AFF] w-full hover:bg-[#5a3de0] text-white py-3 px-6 text-base rounded-xl"
            onClick={handleTryAgain}>
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}
