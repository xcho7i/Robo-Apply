import React, { useState } from "react"
import AudioIcon from "@/src/assets/dashboardIcons/audioIcon.svg"
import VideoIcon from "@/src/assets/dashboardIcons/videoIcon.svg"
import copilotExtensionIcon from "@/src/assets/dashboardIcons/copilotExtensionIcon.svg"
import chatNotifications from "@/src/assets/dashboardIcons/chatNotifications.svg"
import openBrowserIcon from "@/src/assets/dashboardIcons/openBrowserIcon.svg"
import Button from "@/src/components/Button/index"

const Permission = () => {
  const mandatoryList = [
    {
      icon: AudioIcon,
      title: "Audio",
      content:
        "Allows the AI to give accurate feedback based on your conversation and materials.",
      isRequestRequired: true, // No URL, handled by media API
      type: "audio"
    },
    {
      icon: VideoIcon,
      title: "Video",
      content: "Enabling the camera enhances the realism of mock interview.",
      isRequestRequired: true, // No URL, handled by media API
      type: "video"
    },
    {
      icon: copilotExtensionIcon,
      title: "Coding Copilot Extension",
      content:
        "You can take screenshots with code during the interview to allow the copilot to help you analyze and generate solutions.",
      warning:
        "You need to install the RoboApply Google extension to receive program advice from our Coding Copilot. Add from Chrome Web Store and enable it.",
      isRequestRequired: false,
      type: "extension"
    }
  ]

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedPermission, setSelectedPermission] = useState(null)

  const handleRequest = (type) => {
    setSelectedPermission({ type } as any)
    setIsModalVisible(true)

    if (type === "audio") {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => console.log("Audio permission granted"))
        .catch((err) => console.error("Audio permission denied:", err))
    } else if (type === "video") {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => console.log("Video permission granted"))
        .catch((err) => console.error("Video permission denied:", err))
    } else if (type === "notification") {
      //   window.open(requestUrl, "_blank");

      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted");
        } else {
          console.log("Notification permission denied");
        }
      });
    }
  }

  const handleCloseModal = () => {
    setIsModalVisible(false)
    setSelectedPermission(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-[#404040] text-lg p-4 rounded-lg mb-3">
        The following settings will affect all interviews, while the settings
        within each interview will only affect that specific interview.
      </div>

      <div className="flex flex-col gap-6">
        <p className="font-bold text-3xl">Mandatory</p>
        <div className="flex flex-col gap-4">
          {mandatoryList.map((mandatory, index) => (
            <MandatoryPanel
              key={index}
              src={mandatory.icon}
              title={mandatory.title}
              content={mandatory.content}
              warning={mandatory.warning}
              isRequestRequired={mandatory.isRequestRequired}
              onRequest={() => handleRequest(mandatory.type)}
            />
          ))}
        </div>
        <p className="font-bold text-3xl">Optional</p>
        <MandatoryPanel
          src={chatNotifications}
          title={"Browser Notifications"}
          content={
            "Get timely updates on interview report progress and special offers."
          }
          isRequestRequired={true}
          warning={null}
          onRequest={() => handleRequest("notification")}
        />

        <p className="flex items-center text-lg gap-2">
          I don't Know How to enable permissions{" "}
          <span>
            <a href="" target="_blank">
              <img src={openBrowserIcon} alt="" />
            </a>
          </span>
        </p>
      </div>

      {/* {isModalVisible && selectedPermission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#333333] rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-xl font-bold">
                Allow{" "}
                {selectedPermission.type.charAt(0).toUpperCase() +
                  selectedPermission.type.slice(1)}{" "}
                Access
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-white text-2xl">
                &times;
              </button>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              {selectedPermission.type === "extension"
                ? "Please install the extension by clicking the button below or follow the link to the Chrome Web Store."
                : `Please allow ${selectedPermission.type} access to proceed with the interview. This will enhance your experience.`}
            </p>
            <div className="flex justify-end gap-4">
              <Button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-[#404040] text-white rounded-md hover:bg-[#505050]">
                Cancel
              </Button>
              <Button
                onClick={() => handleRequest(selectedPermission.type)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Allow
              </Button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  )
}

const MandatoryPanel = ({
  src,
  title,
  content,
  warning,
  isRequestRequired,
  onRequest
}) => {
  return (
    <div className="flex items-start gap-4 bg-[#2c2c2c] p-4 rounded-lg">
      <div className="flex flex-col gap-4 w-full text-white">
        <div className="flex items-center gap-2">
          <img src={src} alt={title} className="w-6 h-6" />
          <p className="text-xl">{title}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-lg text-gray-300">{content}</p>
          {isRequestRequired && (
            <Button
              onClick={onRequest}
              className="text-white bg-[#404040] px-4 py-2 rounded-md text-sm mt-2 hover:underline">
              Request
            </Button>
          )}
        </div>
        {warning && (
          <p className="text-lg text-red-500 px-2 rounded-lg">
            {warning}
          </p>
        )}
      </div>
    </div>
  )
}

export default Permission
