import Button from "@/src/components/Button/index"
import { PlusOutlined } from "@ant-design/icons"
import EditIcon from "@/src/assets/dashboardIcons/editIcon.svg"
import { useEffect, useState } from "react"
import API_ENDPOINTS from "@/src/api/endpoints"
import { useAdditionalContext } from "@/src/contexts/InterviewCopilotSettingContext"
import { errorToast, successToast } from "@/src/components/Toast"

const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const AdditionalContext = () => {
  const { contextList, setContextList } = useAdditionalContext()
  const [isVisibleContextCreation, setVisibleContextCreation] =
    useState<boolean>(false)
  const [additionalContextTemp, setAdditionalContextTemp] = useState("")

  const userData = JSON.parse(localStorage.getItem("user_data") || "{}")
  const userId = userData?._id

  useEffect(() => {
    fetchContexts()
  }, [])

  const fetchContexts = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.GetInterviewContexts}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userId: userId
          })
        }
      )

      if (!response.ok) {
        throw new Error("Failed to fetch contexts")
      }

      const data = await response.json()

      if (data.success) {
        setContextList(data.contexts)
      }
    } catch (error) {
      console.error("Error fetching contexts:", error)
    }
  }

  const handleContextCreation = () => {
    setVisibleContextCreation(true)
  }

  const handleConfirm = () => {
    setVisibleContextCreation(false)
    setContextList((prev) => [...prev, additionalContextTemp])
  }

  const saveContextList = async () => {
    console.log("additionalContextTemp => ", additionalContextTemp)
    console.log("contextList => ", contextList)
    const requestBody = {
      userId: userId,
      contexts: contextList
    }

    try {
      const response = await fetch(
        `${BASE_URL}${API_ENDPOINTS.AddInterviewContexts}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        }
      )

      if (!response.ok) {
        const errorText = await response.text() 
        throw new Error(
          `Request failed with status ${response.status}: ${errorText}`
        )
      }

      let result: any
      try {
        result = await response.json()
      } catch (jsonError: any) {
        throw new Error(`Failed to parse JSON response: ${jsonError.message}`)
      }

      if (!result.success) {
        throw new Error(result.msg || "Failed to save contexts")
      }

      successToast("Contexts saved successfully:")
    } catch (error: any) {
      console.error("Error saving contexts:", error)
      errorToast(`Error saving contexts: ${error.message}`)
    } finally {
    }
  }

  const updateSingleContext = async (index: number, newContent: string) => {
    const updatedList = [...contextList]
    updatedList[index] = newContent
    setContextList(updatedList)
  }

  const cancelContextListUpdate = () => {}

  const handleCancel = () => {
    setVisibleContextCreation(false)
  }

  return (
    <>
      <div className="flex flex-col gap-8 ">
        <div className="flex justify-between items-start">
          <p>Additional Context</p>
          <Button
            onClick={handleContextCreation}
            className="p-2 px-4 bg-gradient-to-b from-gradientStart to-gradientEnd text-white rounded">
            <PlusOutlined /> <span> Create Context </span>
          </Button>
        </div>
        <div className="flex w-full font-semibold justify-between gap-6 px-4 py-4 bg-[#313131] rounded-lg">
          <span>Context Name</span>
          <span>Details</span>
        </div>
        <div className="flex flex-col gap-4">
          {contextList?.map((context, _index) => (
            <ContextPanel
              key={_index}
              contextId={_index}
              context={context}
              onUpdate={updateSingleContext}
            />
          ))}
        </div>
        <div className="flex justify-between">
          {contextList.length > 0 && (
            <>
              <Button
                onClick={() => saveContextList()}
                className="w-fit p-3 px-5 flex items-center justify-center whitespace-nowrap space-x-2 max-w-full text-primary min-w-max text-navbar text-center font-bold rounded-lg 
                        bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd
                      ">
                <p>Save</p>
              </Button>
              <Button
                onClick={() => cancelContextListUpdate()}
                className="w-fit p-3 px-5 flex items-center justify-center whitespace-nowrap space-x-2 max-w-full text-primary min-w-max text-navbar text-center font-bold rounded-lg 
                        bg-[#404040]
                      ">
                <p>Cancel</p>
              </Button>
            </>
          )}
        </div>
      </div>

      {isVisibleContextCreation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="w-[30%] bg-[#313131] p-8 rounded-lg ">
            <textarea
              value={additionalContextTemp}
              onChange={(e) => setAdditionalContextTemp(e.target.value)}
              placeholder="Lorem ipsum dolor sit amet consectetur. Blandit ut malesuada ac morbi erat.Lorem ipsum dolor sit amet consectetur. Blandit ut malesuada ac morbi erat.Lorem ipsum dolor sit amet consectetur. Blandit ut malesuada ac morbi erat."
              className="w-full p-2 bg-[#454545] text-white rounded h-24 resize-none custom-scrollbar mb-4"
            />
            <div className="flex justify-between">
              <Button
                onClick={handleConfirm}
                className="p-2 px-4 bg-gradient-to-b from-gradientStart to-gradientEnd text-white rounded">
                <span> Confirm </span>
              </Button>
              <Button
                onClick={handleCancel}
                className="p-2 px-4 text-white rounded bg-[#454545] hover:bg-[#424244]">
                <span> Cancel </span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const ContextPanel = ({ contextId, context, onUpdate }) => {
  const { updateContext } = useAdditionalContext()
  const [isEditing, setIsEditing] = useState(false)
  const [editableContent, setEditableContent] = useState(context)

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault() // prevent new line
      setIsEditing(false)

      // Call the parent update function
      await onUpdate(contextId, editableContent)
    }
  }

  return (
    <div className="flex flex-col bg-[#313131] p-4 rounded-lg">
      <div className="flex flex-row justify-between">
        <span className="font-semibold">Context {contextId + 1}</span>
        <div
          className="bg-[#123d1b] flex items-center gap-2 p-2 text-[#05AB15] rounded-lg cursor-pointer"
          onClick={() => setIsEditing(true)}>
          <img src={EditIcon} alt="" />
          <p>Edit</p>
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={editableContent}
          autoFocus
          onChange={(e) => setEditableContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-2 bg-[#454545] text-white rounded h-24 resize-none custom-scrollbar mt-2"
        />
      ) : (
        <div className="mt-2">{editableContent}</div>
      )}
    </div>
  )
}

export default AdditionalContext
