import React from "react"
import { MdClose } from "react-icons/md"
import Button from "../../../../components/Button"

const InterviewDeleteModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-almostBlack border border-primary rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary">
            Delete Interview Guide
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors">
            <MdClose size={24} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-primary">
            Are you sure you want to delete this interview guide? This action
            cannot be undone.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            onClick={onClose}
            className="px-4 py-2 text-primary border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors">
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="px-4 py-2 bg-yellow text-primary rounded-lg hover:bg-red-700 transition-colors">
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

export default InterviewDeleteModal
