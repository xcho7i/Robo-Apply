import {
  SubscriptionType,
  useSubscriptionStore
} from "@/src/stores/subscription"
import { getPercentage } from "@/src/utils"
import { SearchProps, Job, JobHistory, Resume, ResumeList } from "@types"
import { create } from "zustand"

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

type DashboardContextType = {
  showComponent: "home" | "ResultReport" | "jobsFound"
  setShowComponent: (
    showComponent: "home" | "ResultReport" | "jobsFound"
  ) => void
  loading: boolean
  setLoading: (loading: boolean) => void

  selectedResume: Resume
  setSelectedResume: (selectedResume: Resume) => void

  applyResults: JobHistory[]
  setApplyResults: (applyResults: JobHistory[]) => void

  jobsFound: Job[]
  setJobsFound: (jobsFound: Job[]) => void

  fromValues: SearchProps
  setFromValues: (fromValues: SearchProps) => void

  resumeList: ResumeList[]
  setResumeList: (resumeList: ResumeList[]) => void

  startNewSearch: () => void

  gotoJobFound: (
    loading: boolean,
    jobsFound: Job[],
    showComponent: "jobsFound",
    fromValues: SearchProps,
    selectedResume: Resume
  ) => void
}

export const useDashboardStore = create<DashboardContextType>((set) => ({
  showComponent: "home" as "home" | "ResultReport" | "jobsFound",
  setShowComponent: (showComponent: "home" | "ResultReport" | "jobsFound") =>
    set(() => ({ showComponent })),

  loading: false as boolean,
  setLoading: (loading: boolean) => set(() => ({ loading })),

  selectedResume: {} as Resume,
  setSelectedResume: (selectedResume: Resume) =>
    set(() => ({ selectedResume })),

  applyResults: [] as JobHistory[],
  setApplyResults: (applyResults: JobHistory[]) =>
    set(() => ({ applyResults })),

  jobsFound: [] as Job[],
  setJobsFound: (jobsFound: Job[]) => set(() => ({ jobsFound })),

  fromValues: {} as SearchProps,
  setFromValues: (fromValues: SearchProps) => set(() => ({ fromValues })),

  resumeList: [] as ResumeList[],
  setResumeList: (resumeList: ResumeList[]) => set(() => ({ resumeList })),

  startNewSearch: () =>
    set(() => ({
      showComponent: "home",
      applyResults: [],
      jobsFound: [],
      loading: false
    })),

  gotoJobFound: (
    loading: boolean,
    jobsFound: Job[],
    showComponent: "jobsFound",
    fromValues: SearchProps,
    selectedResume: Resume
  ) =>
    set(() => ({
      loading,
      jobsFound,
      showComponent,
      fromValues,
      selectedResume
    }))
}))

function limitsDataHandler(sub: SubscriptionType, totalApplied: number) {
  useSubscriptionStore((state) => state.monthlyCredits)
  if (sub.subscription && sub.subscription.planName) {
    const dailyLimit: LimitCard = {
      jobLimit: sub.subscription.dailyLimit,
      progress: getPercentage(
        sub.subscription.dailyLimit,
        sub.subscription.usage.autoAppliesUsed
      ),
      jobsLeft:
        sub.subscription.dailyLimit - sub.subscription.usage.autoAppliesUsed,
      label: `${sub.subscription.usage.autoAppliesUsed} Jobs Applied Today`,
      title: "Daily Job Limit",
      jobsLeftLabel: "Jobs Limit Left —"
    }

    const planDetails: LimitCard = {
      jobLimit: sub.subscription.planName,
      progress: getPercentage(
        sub.subscription.monthlyCredits,
        sub.subscription.usage.monthlyCreditsUsed
      ),
      jobsLeft: sub.subscription.remaining.monthlyCredits,
      label: `You are subscribed to ${sub.subscription.planName}`,
      title: "Your Plan Details",
      jobsLeftLabel: "Credits Left —"
    }

    const total: LimitCard = {
      jobLimit: totalApplied,
      progress: getPercentage(
        sub.subscription.dailyLimit,
        sub.subscription.usage.autoAppliesUsed
      ),
      jobsLeft: null,
      label: `${sub.subscription.usage.autoAppliesUsed} Jobs Applied Today`,
      title: "Total Jobs Applied",
      jobsLeftLabel: null
    }

    return [dailyLimit, planDetails, total]
  }
}
