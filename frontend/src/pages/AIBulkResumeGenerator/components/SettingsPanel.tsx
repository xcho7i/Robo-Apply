import React, { useState, useCallback } from "react"
import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../components/ui/select"
import { Target } from "lucide-react"

interface SettingsPanelProps {
  language: string
  yearsOfExperience: { value: string; custom: boolean }
  onLanguageChange: (value: string) => void
  onYearsOfExperienceChange: (value: { value: string; custom: boolean }) => void
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  language,
  yearsOfExperience,
  onLanguageChange,
  onYearsOfExperienceChange
}) => {
  const [customYears, setCustomYears] = useState("")

  const handleYearsChange = (value: string) => {
    if (value !== "Other") {
      return onYearsOfExperienceChange({ value: value, custom: false })
    }

    onYearsOfExperienceChange({ value: "", custom: true })
  }

  const handleCustomYearsChange = (value: string) => {
    setCustomYears(value)
    // Use debounced function to prevent conflicts
    onYearsOfExperienceChange({ value, custom: true })
  }

  // Simple debounce function
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }
  return (
    <div className="bg-almostBlack rounded-xl p-6 border border-customGray" data-tour="ai-single-coreSettings">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
        {/* <Target className="h-5 w-5 text-purple" /> */}
        Core Settings
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="text-base font-medium text-primary">Language</Label>
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger className="h-[53px] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm placeholder:text-gray-500 focus:bg-[rgba(69,69,69,1)] appearance-none flex w-full bg-dropdownBackground text-primary rounded py-4 px-3 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 text-sm border border-formBorders hover:border-blue-400 transition-colors text-left items-center justify-between [&>svg]:hidden">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-multipleDropdownBackground border border-formBorders text-primary max-h-[400px] overflow-auto">
              <SelectItem
                value="English (US)"
                className="text-primary hover:bg-purple/20 focus:bg-purple/20 data-[highlighted]:bg-purple/20 data-[highlighted]:text-primary">
                English (US)
              </SelectItem>
              <SelectItem
                value="English (UK)"
                className="text-primary hover:bg-purple/20 focus:bg-purple/20 data-[highlighted]:bg-purple/20 data-[highlighted]:text-primary">
                English (UK)
              </SelectItem>
              <SelectItem
                value="Spanish"
                className="text-primary hover:bg-purple/20 focus:bg-purple/20 data-[highlighted]:bg-purple/20 data-[highlighted]:text-primary">
                Spanish
              </SelectItem>
              <SelectItem
                value="French"
                className="text-primary hover:bg-purple/20 focus:bg-purple/20 data-[highlighted]:bg-purple/20 data-[highlighted]:text-primary">
                French
              </SelectItem>
              <SelectItem
                value="German"
                className="text-primary hover:bg-purple/20 focus:bg-purple/20 data-[highlighted]:bg-purple/20 data-[highlighted]:text-primary">
                German
              </SelectItem>
              <SelectItem
                value="Italian"
                className="text-primary hover:bg-purple/20 focus:bg-purple/20 data-[highlighted]:bg-purple/20 data-[highlighted]:text-primary">
                Italian
              </SelectItem>
              <SelectItem
                value="Portuguese"
                className="text-primary hover:bg-purple/20 focus:bg-purple/20 data-[highlighted]:bg-purple/20 data-[highlighted]:text-primary">
                Portuguese
              </SelectItem>
              <SelectItem
                value="Russian"
                className="text-primary hover:bg-purple/20 focus:bg-purple/20 data-[highlighted]:bg-purple/20 data-[highlighted]:text-primary">
                Russian
              </SelectItem>
              <SelectItem
                value="Chinese"
                className="text-primary hover:bg-purple/20 focus:bg-purple/20 data-[highlighted]:bg-purple/20 data-[highlighted]:text-primary">
                Chinese
              </SelectItem>
              <SelectItem
                value="Japanese"
                className="text-primary hover:bg-purple/20 focus:bg-purple/20 data-[highlighted]:bg-purple/20 data-[highlighted]:text-primary">
                Japanese
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium text-primary">
            Years of Experience
          </Label>
          <div className="flex flex-col md:flex-row md:gap-3">
            <div className={yearsOfExperience.custom ? "md:flex-1" : "w-full"}>
              <Select
                value={
                  yearsOfExperience?.custom ? "Other" : yearsOfExperience.value
                }
                onValueChange={handleYearsChange}>
                <SelectTrigger className="h-[53px] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm placeholder:text-gray-500 focus:bg-[rgba(69,69,69,1)] appearance-none flex w-full bg-dropdownBackground text-primary rounded py-4 px-3 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 text-sm border border-formBorders hover:border-blue-400 transition-colors text-left items-center justify-between [&>svg]:hidden">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-multipleDropdownBackground border border-formBorders text-primary max-h-[400px] overflow-auto">
                  <SelectItem
                    value="Intern"
                    className="text-primary hover:bg-purple/20 focus:bg-purple/20 data-[highlighted]:bg-purple/20 data-[highlighted]:text-primary">
                    Intern
                  </SelectItem>
                  <SelectItem
                    value="1"
                    className="text-primary hover:bg-purple/20 focus:bg-purple/20 data-[highlighted]:bg-purple/20 data-[highlighted]:text-primary">
                    1
                  </SelectItem>
                  <SelectItem
                    value="2"
                    className="text-primary hover:bg-purple/20 focus:bg-purple/20 data-[highlighted]:bg-purple/20 data-[highlighted]:text-primary">
                    2
                  </SelectItem>
                  <SelectItem
                    value="3"
                    className="text-primary hover:bg-purple/20 focus:bg-purple/20 data-[highlighted]:bg-purple/20 data-[highlighted]:text-primary">
                    3
                  </SelectItem>
                  <SelectItem
                    value="4"
                    className="text-primary hover:bg-purple/20 focus:bg-purple/20 data-[highlighted]:bg-purple/20 data-[highlighted]:text-primary">
                    4
                  </SelectItem>
                  <SelectItem
                    value="5"
                    className="text-primary hover:bg-purple/20 focus:bg-purple/20 data-[highlighted]:bg-purple/20 data-[highlighted]:text-primary">
                    5
                  </SelectItem>
                  <SelectItem
                    value="6"
                    className="text-primary hover:bg-purple/20 focus:bg-purple/20 data-[highlighted]:bg-purple/20 data-[highlighted]:text-primary">
                    6
                  </SelectItem>
                  <SelectItem
                    value="7"
                    className="text-primary hover:bg-purple/20 focus:bg-purple/20 data-[highlighted]:bg-purple/20 data-[highlighted]:text-primary">
                    7
                  </SelectItem>
                  <SelectItem
                    value="8"
                    className="text-primary hover:bg-purple/20 focus:bg-purple/20 data-[highlighted]:bg-purple/20 data-[highlighted]:text-primary">
                    8
                  </SelectItem>
                  <SelectItem
                    value="9"
                    className="text-primary hover:bg-purple/20 focus:bg-purple/20 data-[highlighted]:bg-purple/20 data-[highlighted]:text-primary">
                    9
                  </SelectItem>
                  <SelectItem
                    value="10"
                    className="text-primary hover:bg-purple/20 focus:bg-purple/20 data-[highlighted]:bg-purple/20 data-[highlighted]:text-primary">
                    10
                  </SelectItem>
                  <SelectItem
                    value="Other"
                    className="text-primary hover:bg-purple/20 focus:bg-purple/20 data-[highlighted]:bg-purple/20 data-[highlighted]:text-primary">
                    Other
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom years input - shows when "Other" is selected */}
            {yearsOfExperience?.custom && (
              <div className="md:flex-1 mt-3 md:mt-0">
                <Input
                  type="number"
                  value={customYears}
                  onChange={(e) => handleCustomYearsChange(e.target.value)}
                  onKeyDown={(e) => {
                    // Prevent 'e', 'E', '+', '-', '.' from being entered
                    if (["e", "E", "+", "-", "."].includes(e.key)) {
                      e.preventDefault()
                    }
                  }}
                  placeholder="Enter years"
                  style={{
                    MozAppearance: "textfield" // Firefox
                  }}
                  className="h-[53px] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm placeholder:text-gray-500 focus:bg-[rgba(69,69,69,1)] appearance-none block w-full bg-dropdownBackground text-primary rounded py-4 px-3 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 text-sm border border-formBorders hover:border-blue-400 transition-colors [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
