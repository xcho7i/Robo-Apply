import Button from "@/src/components/Button/index"
import { useState } from "react"
import Permission from "./Permission"
import Copilot from "./Copilot"
import AdditionalContext from "./AdditionalContext"
import ArrowDown from "@/src/assets/dashboardIcons/arrowDown.svg"

const Setting = ({ setSettingVisible }: { setSettingVisible: (visible: boolean) => void }) => {
  const [selectedOption, setSelectedOption] = useState("Permission")

  const options = ["Permission", "Copilot", "Additional Context"]

  return (
    <>
      <div className="flex flex-col gap-6 justify-start">
        <div className="flex justify-between items-center">
          <p className="font-bold text-3xl mb-3">Settings</p>
          <Button className="p-2 flex items-center text-navbar font-medium rounded bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd" onClick={() => setSettingVisible(false)}>Back</Button>
        </div>
          
        <div className="flex gap-4 justify-start">
          {options.map((option) => {
            const isActive = selectedOption === option
            return (
              <Button
                key={option}
                onClick={() => setSelectedOption(option)}
                className={`p-3 px-5 flex items-center whitespace-nowrap space-x-2 max-w-full min-w-max font-bold rounded-full
                ${
                  isActive
                    ? "text-white bg-gradient-to-b from-gradientStart to-gradientEnd hover:ring-2 hover:ring-gradientEnd focus:ring-2 focus:ring-gradientEnd"
                    : "text-primary bg-[#2c2c2c] hover:bg-[#3a3a3a]"
                }`}>
                {option}
              </Button>
            )
          })}
        </div>

        {selectedOption === "Permission" && <Permission />}
        {selectedOption === "Copilot" && <Copilot />}
        {selectedOption === "Additional Context" && <AdditionalContext />}
      </div>
    </>
  )
}

export default Setting
