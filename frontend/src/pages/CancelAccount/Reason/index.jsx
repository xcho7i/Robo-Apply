import React, { useState } from "react"

const CancellationReason = () => {
  const [text, setText] = useState("")

  const handleChange = (e) => {
    if (e.target.value.length <= 300) {
      setText(e.target.value)
    }
  }
  return (
    <div className="max-w-2xl mx-auto p-5 font-sans">
      <h1 className="text-2xl mb-5">Cancellation Reason</h1>

      <h3 className="text-base font-normal mb-3">
        Please indicate the reason for cancelling your account:
      </h3>

      <div className="mb-8">
        <select className="w-full p-3 text-gray-500 rounded border border-gray-600 text-base">
          <option className="border" value="">
            Select a reason...
          </option>
          <option value="too-expensive">Too expensive</option>
          <option value="missing-features">Missing features I need</option>
          <option value="found-better-alternative">
            Found a better alternative
          </option>
          <option value="not-useful">Not useful for me</option>
          <option value="poor-customer-service">Poor customer service</option>
          <option value="too-complicated">Too complicated to use</option>
          <option value="other">Other</option>
        </select>
      </div>

      <h3 className="text-base  font-normal mb-3">
        Before you click cancel account, please let us know how we can make your
        experience with RoboApply better:
      </h3>

      <textarea
        className="w-full p-3  rounded border border-gray-600 text-base h-32"
        placeholder="Please type your feedback here..."
        value={text}
        onChange={handleChange}
      />
      <div className="text-right text-sm text-gray-400 mt-1">
        {text.length}/300 characters
      </div>
    </div>
  )
}

export default CancellationReason
