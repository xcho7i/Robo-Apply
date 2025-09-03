import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { jsPDF } from "jspdf"
import DashBoardLayout from "../../../dashboardLayout"
import Button from "../../../components/Button"
import { successToast, errorToast } from "../../../components/Toast"
import editIcon from "../../../assets/generateAiCoverLetterIcons/editIcon.svg"
import regenerateIcon from "../../../assets/generateAiCoverLetterIcons/reGenerateIcon.svg"
import copyIcon from "../../../assets/generateAiCoverLetterIcons/copyIcon.svg"
import sendEmailIcon from "../../../assets/generateAiCoverLetterIcons/sendEmailIcon.svg"
import downloadpdfIcon from "../../../assets/generateAiCoverLetterIcons/downloadpdfIcon.svg"
import coverLetterService from "../../../api/aiService"
import CircularIndeterminate from "../../../components/loader/circular"

const GenerateCoverLetter = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [loadingLoader, setLoadingLoader] = useState(false)

  // Default cover letter template as fallback
  const defaultCoverLetter = `
[Your Name]
[Your Address]
[City, State, ZIP Code]
[Your Email Address]
[Your Phone Number]
[Date]

Hiring Manager
[Company Name]
[Company Address]
[City, State, ZIP Code]

Dear Hiring Manager,

I am writing to express my interest in the [Job Title] position at [Company Name], as advertised on [where you found the job posting]. With my strong background in [mention relevant field or experience], coupled with a passion for [relevant industry or skill], I am excited about the opportunity to contribute to your team and help drive [Company Name]'s success.

In my previous role at [Previous Company Name], I was responsible for [specific responsibility or project], where I [describe a key achievement or contribution that demonstrates relevant skills]. Through this experience, I honed my skills in [mention specific skills like project management, data analysis, etc.] and developed a strong ability to [highlight a relevant strength, like problem-solving, communication, or leadership].

What excites me most about this opportunity is [mention something specific about the company or the role that you find appealing, such as innovation in a particular field, the company's mission, or growth opportunities]. I am confident that my expertise in [key skills] and my dedication to [mention company values or goals] would make me a valuable asset to your team.

I would welcome the chance to discuss how my background and skills align with the goals of [Company Name] in more detail. Thank you for considering my application. I look forward to the possibility of contributing to your continued success.

Sincerely,
[Your Name]
`

  // Use the cover letter from location state if available, otherwise fallback to default
  const [coverLetterText, setCoverLetterText] = useState(
    location.state?.coverLetter || defaultCoverLetter
  )
  const [isEditable, setIsEditable] = useState(false)
  const cursorPosition = useRef(null)

  // Load the generated cover letter on component mount
  useEffect(() => {
    if (location.state?.coverLetter) {
      setCoverLetterText(location.state.coverLetter)
    } else {
      const storedCoverLetter = localStorage.getItem("generatedCoverLetter")
      if (storedCoverLetter) {
        setCoverLetterText(storedCoverLetter)
      } else {
        // Check if we have form data but no letter - this means we need to navigate back
        const formData = localStorage.getItem("coverLetterFormData")
        if (!formData) {
          navigate("/dashboard-cover")
        }
      }
    }
  }, [navigate, location.state])

  const handleBackClick = () => {
    localStorage.removeItem("coverLetterFormData")
    localStorage.removeItem("generatedCoverLetter")
    navigate("/dashboard-cover")
  }

  const handleEditClick = () => {
    setIsEditable(!isEditable)
  }

  const handleTextChange = (e) => {
    // Save the current cursor position before changing the text
    const selection = window.getSelection()
    const range = selection.getRangeAt(0)
    cursorPosition.current = range.startOffset

    const newText = e.target.innerText // Capture the new text
    setCoverLetterText(newText) // Update state with new text
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()

      // Get current selection and range
      const selection = window.getSelection()
      const range = selection.getRangeAt(0)
      const preElement = e.target

      // Create a line break
      const lineBreak = document.createTextNode("\n")

      // Delete current selection contents
      range.deleteContents()

      // Insert the line break
      range.insertNode(lineBreak)

      // Create a new range
      const newRange = document.createRange()

      // Find the text node's parent
      const parentNode = lineBreak.parentNode

      // Create a new text node for the next line
      const nextLineNode = document.createTextNode("")

      // Insert the next line node after the line break
      if (lineBreak.nextSibling) {
        parentNode.insertBefore(nextLineNode, lineBreak.nextSibling)
      } else {
        parentNode.appendChild(nextLineNode)
      }

      // Set the new range to position the cursor at the start of the next line
      newRange.setStart(nextLineNode, 0)
      newRange.setEnd(nextLineNode, 0)

      // Update the selection
      selection.removeAllRanges()
      selection.addRange(newRange)

      // Manually focus the pre element to ensure cursor visibility
      preElement.focus()

      // Update the text state
      setCoverLetterText(preElement.innerText)
    }
  }

  const restoreCursorPosition = (el) => {
    if (cursorPosition.current === null) return
    if (!el.childNodes.length) return

    const selection = window.getSelection()
    const range = document.createRange()
    const textNode = el.childNodes[0]
    const offset = Math.min(cursorPosition.current, textNode.length)
    range.setStart(textNode, offset)
    range.setEnd(textNode, offset)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  const handleCopyClick = () => {
    const textarea = document.createElement("textarea")
    textarea.value = coverLetterText
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand("copy")
    document.body.removeChild(textarea)
    successToast("Cover letter copied to clipboard!")
  }

  const handleRegenerateClick = async () => {
    setLoadingLoader(true)

    const storedData = localStorage.getItem("coverLetterFormData")

    if (!storedData) {
      errorToast("No form data found to regenerate cover letter.")
      setLoadingLoader(false)
      return
    }

    const formData = JSON.parse(storedData)

    try {
      const response = await coverLetterService.generateCoverLetter(formData)

      if (response.cover_letter) {
        setLoadingLoader(false)

        setCoverLetterText(response.cover_letter)
        successToast("Cover letter regenerated successfully!")
      } else {
        errorToast(response.message || "Failed to regenerate cover letter.")
      }
    } catch (error) {
      console.error("Error:", error)
      errorToast("Something went wrong. Please try again.")
    } finally {
      setLoadingLoader(false)
    }
  }

  const handleEmailClick = () => {
    const subject = "Cover Letter"
    const body = encodeURIComponent(coverLetterText.trim())

    const mailtoLink = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${subject}&body=${body}`

    window.open(mailtoLink, "_blank")

    successToast("Cover letter opened in Gmail!")
  }

  const handleDownloadPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(10)

    const textLines = doc.splitTextToSize(coverLetterText, 190)
    doc.text(textLines, 10, 10)

    doc.save("cover_letter.pdf")

    successToast("Cover letter downloaded as PDF!")
  }

  return (
    <>
      {/* Loader Overlay */}
      {loadingLoader && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <CircularIndeterminate />
        </div>
      )}
      <DashBoardLayout>
        <div className="bg-almostBlack w-full h-full border-t-dashboardborderColor border-l-dashboardborderColor border border-r-0 border-b-0">
          <div className="p-4 md:p-10">
            {/* Header Section */}
            {/* <div className="w-full flex flex-row md:flex-row items-center justify-end"> */}
            <div className="sticky top-0  bg-almostBlack w-full flex flex-row md:flex-row items-center justify-end pt-10 pb-4 ">
              {/* Edit Button */}
              <div className="relative group">
                <Button
                  className="p-2 bg-yellow h-10 flex items-center justify-center hover:bg-green-700 hover:shadow-lg transform hover:scale-105 transition duration-300"
                  onClick={handleEditClick}>
                  <img
                    src={editIcon}
                    className="w-6 h-6"
                    loading="lazy"
                    alt="Edit"
                  />
                </Button>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-125 transition-all bg-black text-white text-xs px-2 py-1 rounded z-50">
                  Edit
                </span>
              </div>

              {/* Regenerate Button */}
              <div className="relative group">
                <Button
                  className="p-2 bg-blue h-10 flex items-center justify-center hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 transition duration-300"
                  onClick={handleRegenerateClick}
                  disabled={loading}>
                  <img
                    src={regenerateIcon}
                    className="w-6 h-6"
                    loading="lazy"
                    alt="Regenerate"
                  />
                </Button>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-125 transition-all bg-black text-white text-xs px-2 py-1 rounded z-50">
                  Regenerate
                </span>
              </div>

              {/* Copy Button */}
              <div className="relative group">
                <Button
                  className="p-2 bg-primary h-10 flex items-center justify-center hover:bg-primary-dark hover:shadow-lg transform hover:scale-105 transition duration-300"
                  onClick={handleCopyClick}>
                  <img
                    src={copyIcon}
                    className="w-6 h-6"
                    loading="lazy"
                    alt="Copy"
                  />
                </Button>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-125 transition-all bg-black text-white text-xs px-2 py-1 rounded z-50">
                  Copy
                </span>
              </div>

              {/* Reset Button */}
              <div className="relative group">
                <Button
                  className="p-2 text-sm font-semibold bg-gradient-to-b from-gradientStart to-gradientEnd h-10 flex items-center justify-center hover:from-gradientStartHover hover:to-gradientEndHover hover:shadow-lg transform hover:scale-105 transition duration-300"
                  onClick={handleBackClick}>
                  Reset
                </Button>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-125 transition-all bg-black text-white text-xs px-2 py-1 rounded z-50">
                  Reset
                </span>
              </div>
            </div>

            {/* </div> */}
            {/* Content Section */}
            <div className="w-full mt-5">
              <div className="text-center md:pt-10 pb-5">
                <p className="text-xl md:text-3xl font-normal text-primary">
                  {loading
                    ? "Regenerating Cover Letter..."
                    : "Your AI Cover Letter"}
                </p>
              </div>
              <hr className="border-t-2 border-simplePurple w-[60%] md:w-[40%] mx-auto" />
              <div className="w-full p-4 md:p-10 mt-5 md:mt-10 bg-primary">
                {/* <div className="w-full flex items-end justify-end"></div> */}
                <div className="my-5">
                  <pre
                    className={`whitespace-pre-wrap text-black font-general-sans ${
                      isEditable ? "border border-black p-2" : ""
                    }`}
                    contentEditable={isEditable}
                    suppressContentEditableWarning={true}
                    onInput={handleTextChange}
                    onKeyDown={handleKeyDown}
                    ref={(el) => {
                      if (el && isEditable) {
                        restoreCursorPosition(el)
                      }
                    }}>
                    {coverLetterText}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <hr className="my-5 border-dashboardborderColor" />
          {/* <div className="w-full flex flex-row items-center justify-center gap-3 md:gap-5 pb-10"> */}
          <div className="sticky bottom-0 z-50 bg-almostBlack w-full flex flex-row items-center justify-center gap-3 md:gap-5 pb-10 pt-5">
            <Button
              onClick={handleEmailClick}
              className="p-2 md:px-20 flex items-center justify-center space-x-2 text-center text-navbar rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
              <img
                src={sendEmailIcon}
                className="w-6 h-6"
                loading="lazy"
                alt="Email"
              />
              <span className="font-semibold text-xs md:text-xl">
                Email Cover Letter
              </span>
            </Button>
            <Button
              className="p-2 md:px-20 flex items-center justify-center space-x-2 text-center text-navbar rounded-lg bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
              onClick={handleDownloadPDF}>
              <img
                src={downloadpdfIcon}
                className="w-6 h-6"
                loading="lazy"
                alt="Download"
              />
              <span className="font-semibold text-xs md:text-xl">
                Download PDF
              </span>
            </Button>
          </div>
        </div>
      </DashBoardLayout>
    </>
  )
}

export default GenerateCoverLetter
