import Button from "@/src/components/Button/index"
import { useState, useEffect } from "react"
import { Select, Dropdown, DatePicker } from "antd"
import ArrowDown from "@/src/assets/dashboardIcons/arrowDown.svg"

// Define the settings interface to match CopilotSettingsModal
interface CopilotSettings {
  verbosity: 'concise' | 'default' | 'lengthy'
  language: string
  temperature: 'low' | 'default' | 'high'
  performance: 'speed' | 'quality'
}
// Language options matching CopilotSettingsModal
export const languageOptions = [
  "English (Global)", "English (US)", "English (UK)", "Spanish", "French", "German",
  "Italian", "Portuguese", "Russian", "Chinese (Simplified)", "Chinese (Traditional)",
  "Japanese", "Korean", "Hindi", "Arabic", "Turkish", "Vietnamese",
  "Polish", "Dutch", "Swedish", "Norwegian", "Danish", "Finnish"
]

const Copilot = () => {
  // Initialize settings from localStorage or use defaults
  const getInitialSettings = (): CopilotSettings => {
    const savedSettings = localStorage.getItem('copilotSettings')
    if (savedSettings) {
      return JSON.parse(savedSettings)
    }
    return {
      verbosity: 'default',
      language: 'English (Global)',
      temperature: 'default',
      performance: 'quality'
    }
  }

  const [settings, setSettings] = useState<CopilotSettings>(getInitialSettings)

  const verbosityOptions = ["concise", "default", "lengthy"]
  const temperatureOptions = ["low", "default", "high"]
  const performanceOptions = ["speed", "quality"]


  const items = languageOptions.map((lang, index) => ({
    key: index.toString(),
    label: (
      <div
        className="flex items-center space-x-2"
        onClick={() => updateSetting('language', lang)}>
        <span>{lang}</span>
      </div>
    )
  }))

  // Update a single setting and save to localStorage
  const updateSetting = (key: keyof CopilotSettings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('copilotSettings', JSON.stringify(newSettings))
  }

  const handleConfirm = () => {
    // Settings are already saved to localStorage when updated
    // This function can be used for additional confirmation logic if needed
  }

  const handleCancel = () => {
    // Reset to default settings
    const defaultSettings: CopilotSettings = {
      verbosity: 'default',
      language: 'English (Global)',
      temperature: 'default',
      performance: 'quality'
    }
    setSettings(defaultSettings)
    localStorage.setItem('copilotSettings', JSON.stringify(defaultSettings))
  }

  return (
    <div className="flex flex-col gap-6 px-8 py-6 bg-[#313131] rounded-lg  w-[40%]">
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-lg">Verbosity</p>
        <p className="text-[#CCCCCC]">
          Lorem ipsum dolor sit amet consectetur. Blandit ut male.
        </p>
        <div className="flex justify-around bg-[#454545] p-2 rounded-lg gap-4">
          {verbosityOptions.map((option) => (
            <Button
              key={option}
              onClick={() => updateSetting('verbosity', option)}
              className={`w-1/3 p-3 px-5 flex items-center justify-center whitespace-nowrap space-x-2 max-w-full text-primary min-w-max text-navbar text-center font-bold rounded-lg ${settings.verbosity === option &&
                "bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                }`}>
              <p>{option.charAt(0).toUpperCase() + option.slice(1)}</p>
            </Button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-lg">Language for Copilot responses</p>
        <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
          <Button className="p-3 px-5 flex items-center justify-between whitespace-nowrap space-x-2 max-w-full text-primary min-w-max text-navbar font-bold rounded-lg bg-gradient-to-b bg-[#454545] ">
            <span>{settings.language}</span>
            <img src={ArrowDown} alt="" />
          </Button>
        </Dropdown>
      </div>
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-lg">Copilot Temperature</p>
        <div className="flex justify-around bg-[#454545] p-2 rounded-lg gap-4">
          {temperatureOptions.map((option) => (
            <Button
              key={option}
              onClick={() => updateSetting('temperature', option)}
              className={`w-1/3 p-3 px-5 flex items-center justify-center whitespace-nowrap space-x-2 max-w-full text-primary min-w-max text-navbar text-center font-bold rounded-lg ${settings.temperature === option &&
                "bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                }`}>
              <p>{option.charAt(0).toUpperCase() + option.slice(1)}</p>
            </Button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-lg">Performance Preference</p>
        <div className="flex justify-around bg-[#454545] p-2 rounded-lg gap-4">
          {performanceOptions.map((option) => (
            <Button
              key={option}
              onClick={() => updateSetting('performance', option)}
              className={`w-1/2 p-3 px-5 flex items-center justify-center whitespace-nowrap space-x-2 max-w-full text-primary min-w-max text-navbar text-center font-bold rounded-lg ${settings.performance === option &&
                "bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                }`}>
              <p>{option.charAt(0).toUpperCase() + option.slice(1)}</p>
            </Button>
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        <Button
          onClick={() => handleConfirm()}
          className="w-fit p-3 px-5 flex items-center justify-center whitespace-nowrap space-x-2 max-w-full text-primary min-w-max text-navbar text-center font-bold rounded-lg 
                bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd
              ">
          <p>Confirm</p>
        </Button>
        <Button
          onClick={() => handleCancel()}
          className="w-fit p-3 px-5 flex items-center justify-center whitespace-nowrap space-x-2 max-w-full text-primary min-w-max text-navbar text-center font-bold rounded-lg 
                bg-[#404040]
              ">
          <p>Cancel</p>
        </Button>
      </div>
    </div>
  )
}

export default Copilot
