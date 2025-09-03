import { IoInformationCircleSharp } from "react-icons/io5"

function Tooltip({
  credits,
  message
}: {
  credits?: number | string
  message?: string
}) {
  return (
    <div className="group relative">
      <IoInformationCircleSharp
        className="text-primary  cursor-pointer transition-colors duration-200"
        size={16}
      />
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 scale-0 group-hover:scale-100 transition-all duration-200 z-10">
        <div className="bg-gray-800 text-white text-sm rounded px-3 py-2 whitespace-nowrap shadow-lg">
          {message ? (
            <strong>{message}</strong>
          ) : (
            <strong>Uses {credits} credits</strong>
          )}

          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
        </div>
      </div>
    </div>
  )
}
export default Tooltip
