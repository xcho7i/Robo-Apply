"use client"

import React, { useState, useEffect } from "react"
import FormCardLayout from "../../../components/common/FormCardLayout"
import FormHeading from "../../../components/common/FormHeading"
import FormPara from "../../../components/common/FormPara"
import StepNavigation from "../../../components/common/StepNavigation"
import { DollarSign } from "lucide-react"
import Dropdown from "../../../components/common/Dropdown"
import * as SliderPrimitive from "@radix-ui/react-slider"
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger
} from "../../../components/ui/tooltip"
import { TooltipContent } from "../../../components/ui/tooltip"
import ProgressBar from "@/src/components/common/ProgressBar"

interface StepNineProps {
  onboardingData: any
  setOnboardingData: (data: any) => void
  onNextStep: () => void
  onPreviousStep: () => void
}

// Currency data

const currencies = [
  { name: "US Dollar", symbol: "$", code: "USD" },
  { name: "Euro", symbol: "€", code: "EUR" },
  { name: "British Pound", symbol: "£", code: "GBP" },
  { name: "Canadian Dollar", symbol: "C$", code: "CAD" },
  { name: "Australian Dollar", symbol: "A$", code: "AUD" },
  { name: "Japanese Yen", symbol: "¥", code: "JPY" },
  { name: "Swiss Franc", symbol: "CHF", code: "CHF" },
  { name: "Chinese Yuan", symbol: "¥", code: "CNY" }
]

// Enhanced Slider Component with Radix UI
const SalarySlider = ({
  value,
  onChange,
  min = 0,
  max = 300000,
  step = 1000,
  formatValue,
  selectedCurrency
}: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  formatValue: (value: number) => string
  selectedCurrency: any
}) => {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full flex items-center" style={{ height: 60 }}>
        <div className="w-full px-2">
          <SliderPrimitive.Root
            value={[value]}
            onValueChange={([v]) => onChange(v)}
            min={min}
            max={max}
            step={step}
            className="relative flex w-full touch-none items-center select-none">
            <SliderPrimitive.Track className="bg-[#8B6B1B] relative grow overflow-hidden rounded-full h-5 w-full">
              <SliderPrimitive.Range className="bg-[#FFC700] absolute h-full" />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb className="bg-[#FFC700] block size-6 shrink-0 rounded-full border-none shadow-lg transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden">
              {/* <TooltipProvider>
                <Tooltip open>
                  <TooltipTrigger asChild className="pointer-events-none">
                    <div className="w-full h-full pointer-events-none" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    sideOffset={12}
                    className="text-sm font-semibold bg-[#A259FF] text-white px-4 py-3 rounded-sm shadow-lg pointer-events-none">
                    {formatValue(value)}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider> */}
              <div
                className="flex items-center justify-center border-white border-2 absolute bottom-full w-fit whitespace-nowrap left-1/2 transform -translate-x-1/2 mb-3 text-sm font-semibold bg-[#A259FF] text-white px-4 py-3 rounded-sm shadow-lg pointer-events-none select-none"
                style={{ zIndex: 50 }}>
                {selectedCurrency.symbol} {formatValue(value)}
              </div>
            </SliderPrimitive.Thumb>
          </SliderPrimitive.Root>
        </div>
      </div>
      {/* Min/Max labels */}
      <div className="flex justify-between w-full px-2 mt-2">
        <span className="text-white text-lg font-normal">
          {formatValue(min)}
        </span>
        <span className="text-white text-lg font-normal">
          {formatValue(max)}
        </span>
      </div>
    </div>
  )
}

// Currency Selector Component
const CurrencySelector = ({
  selectedCurrency,
  onCurrencyChange
}: {
  selectedCurrency: any
  onCurrencyChange: (currency: any) => void
}) => {
  const handleCurrencyChange = (currencyCode: string) => {
    const currency = currencies.find((c) => c.code === currencyCode)
    if (currency) {
      onCurrencyChange(currency)
    }
  }

  const currencyOptions = currencies.map((currency) => ({
    value: currency.code,
    // label: `${currency.symbol} ${currency.code} - ${currency.name}`
    label: `${currency.symbol} - ${currency.name}`
    // icon: <span className="font-medium">{currency.symbol}</span>
  }))

  return (
    <div className="flex items-center gap-2">
      <Dropdown
        value={selectedCurrency.code}
        onValueChange={handleCurrencyChange}
        options={currencyOptions}
        placeholder="Select Currency"
        triggerClassName="w-72 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors"
      />
    </div>
  )
}
const InfoCard = ({ selectedCurrency }: any) => (
  <div className="w-full flex  rounded-xl overflow-hidden shadow-md border border-brand-bgBlue-form-input-border bg-brand-bgBlue-form-input">
    {/* Icon section */}
    <div className="flex items-center justify-center bg-brand-purple px-4 py-4 rounded-l-xl">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent border-2 border-white">
        <DollarSign className="text-white" />
      </div>
    </div>
    {/* Text section */}
    <div className="flex items-center px-6 py-4">
      <FormPara className="text-white">
        The salary is in {selectedCurrency.name}. Entering the lower salary may
        result in more job matches and more interview opportunities
      </FormPara>
    </div>
  </div>
)
const StepNine: React.FC<StepNineProps> = ({
  onboardingData,
  setOnboardingData,
  onNextStep,
  onPreviousStep
}) => {
  const [salary, setSalary] = useState(onboardingData.salary || 120000)
  const [selectedCurrency, setSelectedCurrency] = useState(
    onboardingData.currency || currencies[0]
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (onboardingData.salary) {
      setSalary(onboardingData.salary)
    }
    if (onboardingData.currency) {
      setSelectedCurrency(onboardingData.currency)
    }
  }, [onboardingData])

  const handleSalaryChange = (newSalary: number) => {
    setSalary(newSalary)
  }

  const handleCurrencyChange = (newCurrency: any) => {
    setSelectedCurrency(newCurrency)
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      setOnboardingData((prev: any) => ({
        ...prev,
        salary: salary,
        currency: selectedCurrency
      }))
      onNextStep()
    } catch (err) {
      console.error("Step 9 Error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatAmount = (amount: number) => {
    return `${selectedCurrency.symbol} ${amount.toLocaleString()}`
  }

  return (
    <div>
      <div className="w-full mb-4">
        <ProgressBar step={9} />
      </div>
      <FormHeading
        whiteText="What is your minimum desired"
        yellowText="salary"
        className="mb-10"
      />
      <FormCardLayout>
        <div className="relative w-full max-w-2xl flex flex-col items-center p-6 sm:p-10 gap-6">
          {/* Currency Selector - Top Right */}
          <div className="absolute top-4 right-4">
            <CurrencySelector
              selectedCurrency={selectedCurrency}
              onCurrencyChange={handleCurrencyChange}
            />
          </div>
          <div className="w-full flex flex-col items-center gap-2 mt-20">
            <SalarySlider
              min={0}
              max={300000}
              step={1000}
              value={salary}
              onChange={handleSalaryChange}
              formatValue={(v) => `${v.toLocaleString()}`}
              selectedCurrency={selectedCurrency}
            />
          </div>
          <InfoCard selectedCurrency={selectedCurrency} />
          <div className="w-full flex justify-end mt-4">
            <StepNavigation
              currentStep={9}
              onNext={handleSubmit}
              onPrevious={onPreviousStep}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      </FormCardLayout>
    </div>
  )
}

export default StepNine
