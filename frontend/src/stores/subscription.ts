import { create } from "zustand"
import { getPercentage } from "../utils"

type SubResponse = {
  success: boolean
  subscription: {
    planName: string
    monthlyCredits: number
    dailyLimit: number
    billingCycle: string
    startDate: string
    endDate: string
    isCancelled?: boolean
    usage: {
      jobApplicationsToday: number
      monthlyCreditsUsed: number
      resumeProfilesUsed: number
      tailoredResumesUsed: number
      autoAppliesUsed: number
    }
    remaining: {
      jobApplicationsToday: number
      monthlyCredits: number
      resumeProfiles: number
      tailoredResumes: number
      autoApplies: number
    }
    features: {
      includesAutoApply: boolean
      includesResumeBuilder: boolean
      includesResumeScore: boolean
      includesAICoverLetters: boolean
      includesInterviewBuddy: boolean
      includesTailoredResumes: boolean
    }
    cancelAt: null
  }
  totalRemaining: {
    jobApplicationsToday: number
    monthlyCredits: number
    resumeProfiles: number
    tailoredResumes: number
    autoApplies: number
    extraCredits: number
  }
}

export type SubscriptionType = SubResponse

type LimitCard = {
  title: string
  label: string
  jobLimit: number | string
  progress: number | string
  jobsLeft: number | null
  jobsLeftLabel: string | null
}

const cardDataInitial: LimitCard[] = [
  {
    jobLimit: "0",
    progress: 0,
    jobsLeft: 0,
    label: "0 Jobs Applied Today",
    title: "Daily Job Limit",
    jobsLeftLabel: "Jobs Limit Left- "
  },
  {
    jobLimit: "No Active Plan",
    label: "",
    title: "Your Plan Details",
    jobsLeftLabel: "Credits Left —",
    jobsLeft: 0,
    progress: 0
  },
  {
    jobLimit: "0",
    progress: 0,
    jobsLeft: 0,
    label: "0 Jobs Applied Today",
    title: "Total Jobs Applied",
    jobsLeftLabel: "Jobs Limit Left- "
  }
]

interface SubscriptionStore {
  subscription: SubscriptionType
  dailyLimit: number
  monthlyCredits: number
  remainingCredits: number
  usedPercentage: number
  loadingSubscription: boolean
  limitsData: LimitCard[]
  setSubscription: (
    subscription: SubscriptionType,
    totalApplied: number
  ) => void
  setLoadingSubscription: (subscription: boolean) => void
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  subscription: {} as SubscriptionType,
  loadingSubscription: false,
  dailyLimit: 0,
  monthlyCredits: 0,
  remainingCredits: 0,
  usedPercentage: 0,
  limitsData: cardDataInitial,
  setSubscription: (subscription: SubscriptionType, totalApplied: number) => {
    const sub = subscription?.subscription
    if (!sub) return
    const usedPercentage = getPercentage(
      sub.monthlyCredits,
      sub.usage.monthlyCreditsUsed
    )

    const cardData = limitsDataHandler(sub, totalApplied)

    set({
      subscription,
      usedPercentage,
      dailyLimit: sub.dailyLimit,
      monthlyCredits: sub.monthlyCredits,
      remainingCredits: sub.remaining.monthlyCredits,
      limitsData: cardData
    })
  },
  setLoadingSubscription: (loadingSubscription: boolean) =>
    set({ loadingSubscription })
}))

function limitsDataHandler(
  sub: SubscriptionType["subscription"],
  totalApplied: number
) {
  if (sub && sub.planName) {
    const dailyLimit: LimitCard = {
      jobLimit: sub.dailyLimit,
      progress: getPercentage(sub.dailyLimit, sub.usage.autoAppliesUsed),
      jobsLeft: sub.dailyLimit - sub.usage.autoAppliesUsed,
      label: `${sub.usage.autoAppliesUsed} Jobs Applied Today`,
      title: "Daily Job Limit",
      jobsLeftLabel: "Jobs Limit Left —"
    }

    const planDetails: LimitCard = {
      jobLimit: sub.planName,
      progress: getPercentage(sub.monthlyCredits, sub.usage.monthlyCreditsUsed),
      jobsLeft: sub.remaining.monthlyCredits,
      label: `You are subscribed to ${sub.planName}`,
      title: "Your Plan Details",
      jobsLeftLabel: "Credits Left —"
    }

    const total: LimitCard = {
      jobLimit: totalApplied,
      progress: getPercentage(sub.dailyLimit, sub.usage.autoAppliesUsed),
      jobsLeft: null,
      label: `${sub.usage.autoAppliesUsed} Jobs Applied Today`,
      title: "Total Jobs Applied",
      jobsLeftLabel: null
    }

    return [dailyLimit, planDetails, total]
  }
}
