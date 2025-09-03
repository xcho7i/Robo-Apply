import { AlertTriangle } from "lucide-react"

export default function PaymentFailed({ open, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-[#1C1C1E] text-center text-white rounded-2xl p-8 max-w-md shadow-lg">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="w-12 h-12 text-yellow" />
        </div>

        <h2 className="text-2xl font-bold">Payment Failed</h2>
        <p className="text-gray-400 mt-3 text-sm">
          There was an issue processing your payment.
          <br />
          Please try again.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            className="bg-[#6D4AFF] hover:bg-[#5a3de0] text-white py-3 px-6 text-base rounded-xl"
            onClick={() => {
              onClose()
            }}>
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}
