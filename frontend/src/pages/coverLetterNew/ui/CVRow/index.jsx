import React from "react"
import { FaEdit } from "react-icons/fa"
import Button from "../../../../components/Button"

const CVRow = ({
  label,
  value,
  field,
  editingField,
  onEdit,
  onSave,
  onKeyPress
}) => (
  <div className="flex items-center justify-between py-4 px-6 border-b-4 border-dashboardborderColor last:border-b-0">
    <div className="w-full flex  items-center justify-between">
      <div className="text-primary w-2/6 text-base font-semibold mb-1 justify-start  ">
        {label}
      </div>
      <div className="text-primary w-4/6 text-base font-medium mb-1 justify-start ">
        {editingField === field ? (
          <input
            type="text"
            defaultValue={value}
            className="bg-almostBlack text-primary px-3 py-2 rounded border border-dashboardborderColor focus:border-purple focus:outline-none w-full"
            onKeyDown={(e) => onKeyPress(e, field)}
            onBlur={(e) => onSave(field, e.target.value)}
            autoFocus
          />
        ) : (
          <div className="text-primary font-normal">{value}</div>
        )}
      </div>
    </div>

    <Button
      onClick={() => onEdit(field)}
      className="ml-4 p-2 text-purple hover:text-purple hover:bg-dashboardborderColor rounded-lg transition-colors">
      <FaEdit size={20} />
    </Button>
  </div>
)

export default CVRow
