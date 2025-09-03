import React from "react"
import { BsBoxArrowInRight } from "react-icons/bs"
import { IoDownloadOutline } from "react-icons/io5"
import { GrSync } from "react-icons/gr"
import { errorToast } from "../../../components/Toast"
import SimpleInputField from "../../../components/SimpleInputFields"
import Button from "../../../components/Button"

const CoverLetterTemplate = ({
  userData,
  companyData,
  letterBody,
  showRegenerate,
  handleRegenerate,
  handleRegenerateClick,
  inputValue,
  setInputValue,
  selectedOption,
  handleSelectOption,
  handleCancelRegenerate,
  handleSave
}) => {
  const generatePDF = () => {
    try {
      // Import jsPDF dynamically
      import("jspdf")
        .then(({ jsPDF }) => {
          const doc = new jsPDF()

          // Set font
          doc.setFont("helvetica", "normal")
          doc.setFontSize(12)

          let yPosition = 20
          const lineHeight = 6
          const pageWidth = doc.internal.pageSize.getWidth()
          const margin = 20
          const maxWidth = pageWidth - 2 * margin

          // Helper function to add text with word wrapping
          const addTextWithWrapping = (text, x, y, maxWidth) => {
            if (!text) return y

            const lines = doc.splitTextToSize(text, maxWidth)
            lines.forEach((line) => {
              doc.text(line, x, y)
              y += lineHeight
            })
            return y
          }

          // Add user information
          if (userData.name) {
            yPosition = addTextWithWrapping(
              userData.name,
              margin,
              yPosition,
              maxWidth
            )
          }
          if (userData.address) {
            yPosition = addTextWithWrapping(
              userData.address,
              margin,
              yPosition,
              maxWidth
            )
          }
          if (userData.cityStateZip) {
            yPosition = addTextWithWrapping(
              userData.cityStateZip,
              margin,
              yPosition,
              maxWidth
            )
          }
          if (userData.email) {
            yPosition = addTextWithWrapping(
              userData.email,
              margin,
              yPosition,
              maxWidth
            )
          }
          if (userData.phone) {
            yPosition = addTextWithWrapping(
              userData.phone,
              margin,
              yPosition,
              maxWidth
            )
          }
          if (userData.date) {
            yPosition = addTextWithWrapping(
              userData.date,
              margin,
              yPosition,
              maxWidth
            )
            yPosition += lineHeight // Extra space after date
          }

          // Add company information
          if (companyData.name) {
            yPosition = addTextWithWrapping(
              companyData.name,
              margin,
              yPosition,
              maxWidth
            )
          }
          if (companyData.address) {
            yPosition = addTextWithWrapping(
              companyData.address,
              margin,
              yPosition,
              maxWidth
            )
          }
          if (companyData.cityStateZip) {
            yPosition = addTextWithWrapping(
              companyData.cityStateZip,
              margin,
              yPosition,
              maxWidth
            )
          }

          yPosition += lineHeight // Extra space before letter body

          // Add letter body
          if (letterBody) {
            // Split by line breaks and process each paragraph
            const paragraphs = letterBody.split("\n\n")
            paragraphs.forEach((paragraph, index) => {
              if (paragraph.trim()) {
                // Check if we need a new page
                if (yPosition > doc.internal.pageSize.getHeight() - 40) {
                  doc.addPage()
                  yPosition = 20
                }

                yPosition = addTextWithWrapping(
                  paragraph.trim(),
                  margin,
                  yPosition,
                  maxWidth
                )

                // Add space between paragraphs (except for the last one)
                if (index < paragraphs.length - 1) {
                  yPosition += lineHeight
                }
              }
            })
          }

          // Generate filename
          const filename = `cover_letter_${userData.name || "document"}_${
            new Date().toISOString().split("T")[0]
          }.pdf`

          // Save the PDF
          doc.save(filename)
        })
        .catch((error) => {
          console.error("Error loading jsPDF:", error)
          errorToast("Failed to generate PDF. Please try again.")
        })
    } catch (error) {
      console.error("Error generating PDF:", error)
      errorToast("Failed to generate PDF. Please try again.")
    }
  }

  return (
    <div>
      {/* Letter Section */}
      <div className="flex justify-center mt-10 px-4">
        <div className="bg-white text-black w-full max-w-6xl p-6 md:p-10 rounded-lg shadow-lg text-sm md:text-base leading-relaxed font-medium whitespace-pre-line text-justify">
          {userData.name && (
            <>
              {userData.name}
              <br />
            </>
          )}
          {userData.address && (
            <>
              {userData.address}
              <br />
            </>
          )}
          {userData.cityStateZip && (
            <>
              {userData.cityStateZip}
              <br />
            </>
          )}
          {userData.email && (
            <>
              {userData.email}
              <br />
            </>
          )}
          {userData.phone && (
            <>
              {userData.phone}
              <br />
            </>
          )}
          {userData.date && (
            <>
              {userData.date}
              <br />
              <br />
            </>
          )}

          {companyData.name && (
            <>
              {companyData.name}
              <br />
            </>
          )}
          {companyData.address && (
            <>
              {companyData.address}
              <br />
            </>
          )}
          {companyData.cityStateZip && (
            <>
              {companyData.cityStateZip}
              <br />
            </>
          )}
          <br />

          {letterBody}
        </div>
      </div>

      {/* Regenerate Section */}
      {showRegenerate && (
        <div className="flex justify-center mt-10">
          <div className="rounded-lg flex space-x-10 justify-between w-full max-w-6xl">
            <div className="w-full">
              <div className="mb-4">
                <SimpleInputField
                  placeholder="Product Designer"
                  value={inputValue}
                  onChange={(e) => {
                    const value = e.target.value
                    setInputValue(value)
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  "Make more formal",
                  // "Translate to Spanish",
                  "Make more catchy",
                  "Make it shorter"
                ].map((option) => (
                  <div
                    key={option}
                    onClick={() => handleSelectOption(option)}
                    className={`px-4 py-3 rounded-lg text-sm bg-multipleDropdownBackground hover:bg-gray-600 cursor-pointer transition-colors ${
                      selectedOption === option
                        ? "border border-purple text-white"
                        : "text-white"
                    }`}>
                    {option}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-start p-2">
              <div className="flex space-x-5 justify-end">
                <Button
                  onClick={handleRegenerateClick}
                  className="p-4  gap-2 px-4 sm:px-6 flex items-center justify-center text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
                  Regenerate
                  <GrSync size={20} />
                </Button>
                <Button
                  onClick={handleCancelRegenerate}
                  className="p-4 gap-2 px-4 sm:px-6 flex items-center justify-center text-navbar font-bold rounded-lg bg-gray-600 hover:bg-gray-700 text-primary">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!showRegenerate && (
        <div className="flex justify-center gap-4 mt-10">
          <Button
            onClick={handleSave}
            className="p-2 sm:p-3 gap-2 px-4 sm:px-6 flex  min-w-40 items-center justify-center text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
            {localStorage.getItem("coverLetter_id") ? "Update" : "Save"}
            <BsBoxArrowInRight size={20} />
          </Button>
          <Button
            onClick={generatePDF}
            className="p-2 sm:p-3 gap-2 px-4 sm:px-6 flex  min-w-40 items-center justify-center text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
            Download
            <IoDownloadOutline size={24} />
          </Button>
          <Button
            onClick={handleRegenerate}
            className="p-2 sm:p-3 gap-2 px-4 sm:px-6 flex  min-w-40 items-center justify-center text-navbar font-bold rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
            Regenerate
            <GrSync size={20} />
          </Button>
        </div>
      )}
    </div>
  )
}

export default CoverLetterTemplate
