import { Resume } from "@types"

// Interfaces and types
import type { ICountryData } from "countries-list"

// Utils
import {
  getCountryCode,
  getCountryDataList,
  getEmojiFlag
} from "countries-list"

const countries = getCountryDataList()

function getCountryData(name: string): ICountryData | undefined {
  if (!name || name.trim() == "") return undefined
  const data = countries.find((country) => {
    return (
      name.toLowerCase().includes(country.name.toLowerCase()) ||
      name.toLowerCase().split(" ").includes(country.iso3.toLowerCase()) ||
      name.toLowerCase().split(" ").includes(country.iso2.toLowerCase())
    )
  })
  return data
}

export { countries, getCountryCode, getCountryData, getEmojiFlag }

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getLocalDateStr(dateString: string | number) {
  if (!dateString) return ""

  const date = new Date(dateString)

  return date.toLocaleDateString()
}

export function getPercentage(total: number, value: number): number {
  return Number(((value / total) * 100).toFixed(0))
}

export const plans = [
  {
    name: "Free Plan",
    identifier: "free_plan",
    planType: "individual",
    billingCycle: "monthly",
    price: 0,
    isMostPopular: false,
    tag: "Its Free !!!",
    savingsText: "Free for new users",
    jobLimits: { dailyLimit: 20 },
    monthlyCredits: 60,
    includesAutoApply: true,
    includesResumeBuilder: true,
    includesResumeScore: true,
    includesAICoverLetters: true,
    resumeProfiles: 0,
    includesInterviewBuddy: true,
    includesTailoredResumes: true,
    freeTailoredResumes: 0,
    freeAutoApplies: 0,
    descriptionNote: "For new users"
  },
  {
    name: "Basic Plan",
    identifier: "basic_monthly_individual",
    planType: "individual",
    billingCycle: "monthly",
    price: 47,
    isMostPopular: false,
    tag: "Limited Time !!!",
    savingsText: "Save $120 with yearly",
    jobLimits: { dailyLimit: 20 },
    monthlyCredits: 4000,
    includesAutoApply: true,
    includesResumeBuilder: true,
    includesResumeScore: true,
    includesAICoverLetters: true,
    resumeProfiles: 1,
    includesInterviewBuddy: true,
    includesTailoredResumes: true,
    freeTailoredResumes: 3,
    freeAutoApplies: 3,
    descriptionNote: "Ideal for active job seekers with tailored needs."
  },
  {
    name: "Standard Plan",
    identifier: "standard_monthly_individual",
    planType: "individual",
    billingCycle: "monthly",
    price: 129,
    isMostPopular: true,
    tag: "Most Popular !!!",
    savingsText: "Save $312 with yearly",
    jobLimits: { dailyLimit: 100 },
    monthlyCredits: 30000,
    includesAutoApply: true,
    includesResumeBuilder: true,
    includesResumeScore: true,
    includesAICoverLetters: true,
    resumeProfiles: 5,
    includesInterviewBuddy: true,
    includesTailoredResumes: true,
    freeTailoredResumes: 3,
    freeAutoApplies: 3,
    descriptionNote: "Ideal for active job seekers with tailored needs."
  },
  {
    name: "Premium Plan",
    identifier: "premium_monthly_individual",
    planType: "individual",
    billingCycle: "monthly",
    price: 389,
    isMostPopular: false,
    tag: "",
    savingsText: "Save $936 with yearly",
    jobLimits: { dailyLimit: 500 },
    monthlyCredits: 100000,
    includesAutoApply: true,
    includesResumeBuilder: true,
    includesResumeScore: true,
    includesAICoverLetters: true,
    resumeProfiles: 10,
    includesInterviewBuddy: true,
    includesTailoredResumes: true,
    freeTailoredResumes: 3,
    freeAutoApplies: 3,
    descriptionNote: "Best for power users and recruiters applying at scale."
  },
  {
    name: "Basic Plan",
    identifier: "basic_yearly_individual",
    planType: "individual",
    billingCycle: "yearly",
    price: 37,
    isMostPopular: false,
    tag: "Limited Time !!!",
    savingsText: "Saves you $120",
    jobLimits: { dailyLimit: 20 },
    monthlyCredits: 4000,
    includesAutoApply: true,
    includesResumeBuilder: true,
    includesResumeScore: true,
    includesAICoverLetters: true,
    resumeProfiles: 1,
    includesInterviewBuddy: true,
    includesTailoredResumes: true,
    freeTailoredResumes: 3,
    freeAutoApplies: 3,
    descriptionNote: "Ideal for active job seekers with tailored needs."
  },
  {
    name: "Standard Plan",
    identifier: "standard_yearly_individual",
    planType: "individual",
    billingCycle: "yearly",
    price: 103,
    isMostPopular: true,
    tag: "Most Popular !!!",
    savingsText: "Saves you $312",
    jobLimits: { dailyLimit: 100 },
    monthlyCredits: 30000,
    includesAutoApply: true,
    includesResumeBuilder: true,
    includesResumeScore: true,
    includesAICoverLetters: true,
    resumeProfiles: 5,
    includesInterviewBuddy: true,
    includesTailoredResumes: true,
    freeTailoredResumes: 3,
    freeAutoApplies: 3,
    descriptionNote: "Ideal for active job seekers with tailored needs."
  },
  {
    name: "Premium Plan",
    identifier: "premium_yearly_individual",
    planType: "individual",
    billingCycle: "yearly",
    price: 311,
    isMostPopular: false,
    tag: "",
    savingsText: "Saves you $936",
    jobLimits: { dailyLimit: 500 },
    monthlyCredits: 100000,
    includesAutoApply: true,
    includesResumeBuilder: true,
    includesResumeScore: true,
    includesAICoverLetters: true,
    resumeProfiles: 10,
    includesInterviewBuddy: true,
    includesTailoredResumes: true,
    freeTailoredResumes: 3,
    freeAutoApplies: 3,
    descriptionNote: "Best for power users and recruiters applying at scale."
  }
]
