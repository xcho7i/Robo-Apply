import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import buttonIcon from "../../../../assets/dashboardIcons/startApplyingBtn.svg"
import Button from "../../../../components/Button"
import ExtensionModal from "../../../../components/Modals/ExtensionModal"

const PlatformActivation = ({ logo, platformName, jobCount, infoList }) => {
  const navigate = useNavigate()
  const [HelloWorldInstalled, setHelloWorldInstalled] = useState(false)
  const [showExtensionModal, setShowExtensionModal] = useState(false)
  const [userData, setUserData] = useState(null)

  // Check if the extension is installed
  const checkHelloWorldStatus = () => {
    return new Promise((resolve) => {
      if (
        typeof chrome !== "undefined" &&
        chrome.runtime &&
        chrome.runtime.sendMessage
      ) {
        chrome.runtime.sendMessage(
          "gpgegodpgjenkfdnalacodlocgcfccef",
          { message: "checkHelloWorldInstalled" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.log(
                "Extension is not installed or communication failed:",
                chrome.runtime.lastError
              )
              resolve(false)
            } else {
              resolve(response?.helloWorldInstalled || false)
            }
          }
        )
      } else {
        resolve(false)
      }
    })
  }

  // Fetch user data from localStorage or API
  const fetchUserData = () => {
    try {
      // Example: Get from localStorage
      const storedData = localStorage.getItem("user_data")
      if (storedData) {
        return JSON.parse(storedData)
      }

      // Alternatively, you could fetch from an API:
      // const response = await fetch('/api/user-data');
      // return await response.json();

      return null
    } catch (error) {
      console.error("Error fetching user data:", error)
      return null
    }
  }

  useEffect(() => {
    // Check extension status on component mount
    // checkHelloWorldStatus().then((isInstalled) => {
    //   setHelloWorldInstalled(isInstalled)
    // })

    // Load user data
    const data = fetchUserData()
    setUserData(data)
  }, [])

  const handleApplyClick = async () => {
    const isHelloWorldInstalled = await checkHelloWorldStatus()
    const token = localStorage.getItem("access_token")

    // Get and parse user data consistently
    const userDataString = localStorage.getItem("user_data")
    let userData = null
    try {
      userData = userDataString ? JSON.parse(userDataString) : null
    } catch (e) {
      console.error("Error parsing user_data:", e)
    }

    if (isHelloWorldInstalled) {
      // Get platform-specific URL
      let platformUrl = ""
      switch (platformName) {
        case "LinkedIn":
          platformUrl = "https://www.linkedin.com/jobs/"
          break
        case "Indeed":
          platformUrl = "https://www.indeed.com/"
          break
        case "ZipRecruiter":
          platformUrl = "https://www.ziprecruiter.com/jobs"
          break
        case "Dice":
          platformUrl = "https://www.dice.com/jobs"
          break
        case "Monster":
          platformUrl = "https://www.monster.com/jobs"
          break
        case "SimplyHired":
          platformUrl = "https://www.simplyhired.com/search"
          break
        default:
          platformUrl = "https://www.linkedin.com/jobs/" // Default to LinkedIn
      }

      chrome.runtime.sendMessage(
        "gpgegodpgjenkfdnalacodlocgcfccef",
        {
          action: "sendToken",
          token: token,
          userData: userData,
          platformName: platformName, // Add platform name
          platformUrl: platformUrl // Add platform URL
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error sending message:", chrome.runtime.lastError)
          } else {
            console.log("Message sent to extension successfully!")
          }
        }
      )

      navigate("/dashboard/job-apply", {
        state: { logo, platformName, platformUrl } // Also pass the platformUrl
      })
    } else {
      setShowExtensionModal(true)
    }
  }

  return (
    <div className="w-full min-h-[300px] rounded-lg flex flex-col border md:p-3">
      <div className="p-5 flex items-center w-full justify-start">
        <img
          src={logo}
          alt={`${platformName} Logo`}
          className="w-10 h-10"
          loading="lazy"
        />
        <div className="ml-3">
          <p className="text-xl font-medium text-primary">{platformName}</p>
        </div>
      </div>
      <div className="flex-grow px-6 pb-3">
        <ul className="list-disc pl-5 mt-2 text-xs md:text-sm text-justify">
          {infoList.map((info, index) => (
            <li className="py-1 text-primary" key={index}>
              {info}
            </li>
          ))}
        </ul>
      </div>
      {/* <div className="px-8 md:px-2 py-4">
        <Button
          onClick={() => handleApplyClick()}
          className="flex items-center justify-center gap-2 text-base font-semibold w-full h-12 text-white bg-gradient-to-b from-gradientStart to-gradientEnd rounded-full hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
        >
          <img src={buttonIcon} alt="Start Applying Icon" loading="lazy" />
          Start Applying
        </Button>
      </div> */}

      {showExtensionModal && (
        <ExtensionModal onClose={() => setShowExtensionModal(false)} />
      )}
    </div>
  )
}

export default PlatformActivation
