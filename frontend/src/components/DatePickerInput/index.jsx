import React, { useState, useRef, useEffect } from "react"
import ReactDOM from "react-dom"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { SlCalender } from "react-icons/sl"
import { getYear, getMonth } from "date-fns"

const DatePickerInput = ({
  label,
  placeholder,
  selectedDate,
  onChange,
  className,
  error = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const inputRef = useRef(null)

  const toggleDatePicker = () => {
    setIsOpen((prevState) => !prevState)
  }

  const handleDateChange = (date) => {
    onChange(date)
    setIsOpen(false) // Close the date picker after selecting a date
  }

  // Calculate position when opening the DatePicker
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      const datePickerWidth = 280 // Approximate width of the DatePicker
      setPosition({
        top: rect.top - 320, // Position above the input (320px is approximate height of DatePicker)
        left: rect.right - datePickerWidth // Align to the right side of the input field
      })
    }
  }, [isOpen])

  // Generate year range from 1900 to current year + 5 years (till 2030)
  const currentYear = getYear(new Date())
  const years = []
  for (let year = 1900; year <= currentYear + 5; year++) {
    years.push(year)
  }

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]

  return (
    <div className={`w-full mb-2 ${className}`}>
      <label className="block text-primary text-base font-medium mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={selectedDate ? selectedDate.toLocaleDateString() : ""}
          readOnly
          onClick={() => setIsOpen(!isOpen)} // Toggle date picker on click
          className={`appearance-none block w-full bg-dropdownBackground text-primary rounded py-3 px-4 pr-10 
             focus:outline-none focus:ring-1 placeholder:text-primary
             ${
               error
                 ? "border border-dangerBorder focus:ring-red-500" // Red border for error
                 : "border border-formBorders focus:ring-purple-500 focus:border-purple-500" // Default border
             }`}
        />

        <div
          className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)} // Open the date picker on icon click
        >
          <SlCalender className="text-primary" size={20} />
        </div>
        {isOpen && ReactDOM.createPortal(
          <div 
            className="fixed z-[9999]" 
            style={{ 
              top: position.top,
              left: position.left,
              zIndex: 9999
            }}
          >
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-2">
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                onClickOutside={() => setIsOpen(false)}
                inline
                renderCustomHeader={({
                  date,
                  changeYear,
                  changeMonth,
                  decreaseMonth,
                  increaseMonth,
                  prevMonthButtonDisabled,
                  nextMonthButtonDisabled
                }) => (
                  <div
                    style={{
                      margin: 10,
                      display: "flex",
                      justifyContent: "center"
                    }}>
                    <button
                      onClick={decreaseMonth}
                      disabled={prevMonthButtonDisabled}>
                      {"<"}
                    </button>
                    <select
                      value={getYear(date)}
                      onChange={({ target: { value } }) => changeYear(value)}
                      style={{
                        border: "none",
                        marginRight: "10px",
                        background: "none"
                      }}>
                      {years.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    <select
                      value={months[getMonth(date)]}
                      onChange={({ target: { value } }) =>
                        changeMonth(months.indexOf(value))
                      }
                      style={{ border: "none", background: "none" }}>
                      {months.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={increaseMonth}
                      disabled={nextMonthButtonDisabled}>
                      {">"}
                    </button>
                  </div>
                )}
                popperPlacement="bottom"
                popperModifiers={{
                  preventOverflow: {
                    enabled: true,
                    boundariesElement: "viewport"
                  }
                }}
              />
            </div>
          </div>,
          document.body
        )}
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">This field is required</p> // Error message below the input
      )}
    </div>
  )
}

export default DatePickerInput
