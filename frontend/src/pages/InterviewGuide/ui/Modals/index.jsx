import React from "react"
import { IoMdClose } from "react-icons/io"
import { FaExclamationTriangle, FaSave } from "react-icons/fa"
import Button from "../../../../components/Button"

// Save Session Warning Modal
export const SaveSessionWarningModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-modalPurple rounded-lg p-6 md:p-8 w-full max-w-md relative border">
        <Button
          onClick={onClose}
          className="absolute top-3 right-3 bg-gradient-to-b rounded-full p-0.5 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd">
          <IoMdClose size={20} />
        </Button>

        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-100 rounded-full p-3">
              <FaSave className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">
            Save Chat History
          </h2>

          <p className="text-primary text-base mb-6 leading-relaxed">
            Your current interview session will end after saving the chat
            history. You'll need to start a new session to continue asking
            questions.
          </p>

          <p className="text-yellow-400 text-sm mb-6">
            Are you sure you want to save and end this session?
          </p>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={onClose}
              className="px-6 py-3 font-medium bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="px-6 py-3 font-medium bg-gradient-to-b from-gradientStart to-gradientEnd text-primary rounded-lg hover:ring-2 hover:ring-gradientEnd">
              Save & End Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Refresh Warning Modal
export const RefreshWarningModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-modalPurple rounded-lg p-6 md:p-8 w-full max-w-md relative border">
        <Button
          onClick={onClose}
          className="absolute top-3 right-3 bg-gradient-to-b rounded-full p-0.5 text-primary hover:ring-2 hover:ring-gradientEnd from-gradientStart to-gradientEnd">
          <IoMdClose size={20} />
        </Button>

        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 rounded-full p-3">
              <FaExclamationTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">
            Warning: Session Will Be Lost
          </h2>

          <p className="text-primary text-base mb-4 leading-relaxed">
            Refreshing or leaving this page will end your current interview
            session and all unsaved chat history will be lost.
          </p>

          <p className="text-red-400 text-sm mb-6">
            Do you want to continue? This action cannot be undone.
          </p>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={onClose}
              className="px-6 py-3 font-medium bg-gradient-to-b from-gradientStart to-gradientEnd text-primary rounded-lg hover:ring-2 hover:ring-gradientEnd">
              Stay on Page
            </Button>
            <Button
              onClick={onConfirm}
              className="px-6 py-3 font-medium bg-yellow hover:bg-red-700 text-white rounded-lg hover:ring-yellow-400 hover:ring-2 transition-colors">
              Leave Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
