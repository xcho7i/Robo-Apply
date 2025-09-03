// components/DeleteModal.jsx
import React from "react"
import Button from "../../../../components/Button"

const ResumeDeleteModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-modalPurple rounded-lg shadow-lg p-6 max-w-sm w-full">
        <h2 className="text-lg font-semibold text-red-600">Confirm Deletion</h2>
        <p className="mt-2">Are you sure you want to delete this Resume?</p>
        <div className="mt-4 flex justify-end gap-3">
          <Button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-primary bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd">
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red text-primary hover:bg-rose-700">
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ResumeDeleteModal
