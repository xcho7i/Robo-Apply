import React, { useState, useEffect } from "react"
import { successToast, errorToast } from "../../components/Toast"
import { LuPlus } from "react-icons/lu"
import CircularIndeterminate from "../loader/circular"

const FileUploader = ({ onFileUpload, resetFile }) => {
  const [dragging, setDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [loading, setLoading] = useState(false)

  // Reset file if parent requests reset
  useEffect(() => {
    if (resetFile) {
      setUploadedFile(null)
    }
  }, [resetFile])

  const handleDragOver = (event) => {
    event.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    handleFile(event.dataTransfer.files[0])
  }

  const handleFileChange = (event) => {
    handleFile(event.target.files[0])
  }

  const handleFile = (file) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]

    if (file && validTypes.includes(file.type)) {
      setLoading(true)
      setTimeout(() => {
        setUploadedFile(file)
        successToast(`File "${file.name}" uploaded successfully!`)
        onFileUpload(file) // Pass the file to the parent component
        setLoading(false)
      }, 1000)
    } else {
      errorToast("Please upload a valid .pdf or .docx file.")
    }
  }

  return (
    <div
      className={`w-full px-2 md:px-5 py-y mt-5 border items-center justify-left ${
        dragging ? "border-purple-500" : "border-formBorder border-formBorders"
      } bg-dropdownBackground rounded-md`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}>
      {loading ? (
        <div className="flex justify-center items-center h-full py-3">
          <CircularIndeterminate />
        </div>
      ) : (
        <>
          <div className="md:flex justify-between w-full py-2 items-center">
            <label
              className="bg-purple-500 items-center text-primary text-[10px] md:text-sm font-semibold gap-1 py-2 rounded-md cursor-pointer flex "
              htmlFor="fileUpload">
              <LuPlus className="md:mt-1 " />
              Upload Your Resume here
            </label>
            <input
              id="fileUpload"
              type="file"
              accept=".pdf, .docx, .doc"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-primary text-[10px]  md:text-xs font-light">
              {uploadedFile
                ? `Uploaded: ${uploadedFile.name}`
                : "Must be in Docx or Pdf"}
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export default FileUploader
