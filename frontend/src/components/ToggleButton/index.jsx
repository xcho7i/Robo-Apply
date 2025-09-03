import React, { useState, useEffect } from "react"

const ToggleButton = ({
  isOn: initialIsOn = false,
  onToggle,
  customOffWrapper
}) => {
  const [isOn, setIsOn] = useState(initialIsOn)

  const toggleSwitch = () => {
    const newIsOn = !isOn
    setIsOn(newIsOn)
    if (onToggle) {
      onToggle(newIsOn)
    }
  }

  useEffect(() => {
    setIsOn(initialIsOn)
  }, [initialIsOn])

  return (
    <div
      className="relative inline-flex items-center text-black text-lg pl-2 font-semibold text-right bg-white  p-2 h-10 w-20 border-2 border-gray-400 rounded-full cursor-pointer transition-colors duration-300"
      onClick={toggleSwitch}>
      <div
        className={`absolute inset-0 flex items-center justify-between px-2 text-sm font-medium ${
          isOn ? "text-purple" : "text-gray-400"
        }`}>
        {isOn && (
          <span className="mx-2s text-black text-lg font-semibold ">On</span>
        )}
        {!isOn && <span className="mr-2"></span>}
      </div>
      <span
        className={`inline-block w-8 h-8  border-2 border-white rounded-full transform transition-transform duration-300 ${
          isOn
            ? "translate-x-8 bg-purpleBackground"
            : "translate-x-0 bg-lightestGrey"
        }`}
      />
      {customOffWrapper ? (
        <span className="__custom-off-wrapper" data-on={isOn}>
          Off
        </span>
      ) : (
        "Off"
      )}
    </div>
  )
}

export default ToggleButton
