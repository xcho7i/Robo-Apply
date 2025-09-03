import React, { useEffect } from "react"
import { Link } from "react-router-dom"
import { BsCheckCircle } from "react-icons/bs"

const SuccessPage = () => {
  useEffect(() => {
    localStorage.removeItem("subscription-in-progress")
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 text-center px-4">
      <BsCheckCircle size={100} className="text-green-500 mb-4" />
      <h1 className="text-4xl font-bold text-primary mb-2">
        Subscription Successful
      </h1>
      <p className="text-primary text-lg mb-6">
        Thank you for subscribing the plan! Your account has been upgraded.
      </p>
      <Link
        to="/auto-apply"
        className="bg-green-600 text-2xl font-semibold underline text-primary hover:text-purple px-6 py-2 rounded hover:bg-green-700 transition">
        Go to Dashboard
      </Link>
    </div>
  )
}

export default SuccessPage
