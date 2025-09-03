import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  JobRow,
  CreditValidationResult
} from "../pages/AIBulkResumeGenerator/types"

interface JobGenerationState {
  id: string
  status: "pending" | "generating" | "completed" | "error"
  progress: number
  error?: string
  resumeUrl?: string
  resumeContent?: string
}

interface ResumeGenerationData {
  // Jobs data
  jobs: JobRow[]
  sessionId: string

  // Base resume data
  baseResumeContent: string
  baseResumeFile: File | null
  yearsOfExperience: string
  language: string

  // Generation state
  isGenerating: boolean
  isNavigatedFromBulkGenerator: boolean
  generationProgress: Record<string, JobGenerationState>
  overallProgress: number

  // Credit confirmation
  creditConfirmation: {
    isRequired: boolean
    creditValidation: CreditValidationResult | null
    isLoading: boolean
  }

  // Background process tracking
  backgroundProcessId: string | null
  setupComplete: boolean // Flag to indicate setup is done and resume generation should start
  apiCalls: {
    uploadResume: { status: "pending" | "completed" | "error"; error?: string }
    saveJobs: { status: "pending" | "completed" | "error"; error?: string }
    generateResumes: {
      status: "pending" | "completed" | "error"
      progress: number
      error?: string
    }
  }
}

interface ResumeGenerationActions {
  // Data setters
  setJobs: (jobs: JobRow[]) => void
  setSessionId: (sessionId: string) => void
  setBaseResumeData: (
    content: string,
    file: File | null,
    years: string,
    language: string
  ) => void

  // Generation state
  setIsGenerating: (isGenerating: boolean) => void
  setNavigatedFromBulkGenerator: (navigated: boolean) => void
  updateJobGenerationState: (
    jobId: string,
    state: Partial<JobGenerationState>
  ) => void
  setOverallProgress: (progress: number) => void

  // Credit confirmation
  setCreditConfirmation: (
    confirmation: Partial<ResumeGenerationData["creditConfirmation"]>
  ) => void

  // Background process
  setBackgroundProcessId: (id: string | null) => void
  setSetupComplete: (complete: boolean) => void
  updateApiCallStatus: (
    apiCall: keyof ResumeGenerationData["apiCalls"],
    status: Partial<
      ResumeGenerationData["apiCalls"][keyof ResumeGenerationData["apiCalls"]]
    >
  ) => void

  // Reset/cleanup
  resetStore: () => void
  clearGenerationData: () => void
}

type ResumeGenerationStore = ResumeGenerationData & ResumeGenerationActions

const initialState: ResumeGenerationData = {
  jobs: [],
  sessionId: "",
  baseResumeContent: "",
  baseResumeFile: null,
  yearsOfExperience: "2-5",
  language: "English (US)",
  isGenerating: false,
  isNavigatedFromBulkGenerator: false,
  generationProgress: {},
  overallProgress: 0,
  creditConfirmation: {
    isRequired: false,
    creditValidation: null,
    isLoading: false
  },
  backgroundProcessId: null,
  setupComplete: false,
  apiCalls: {
    uploadResume: { status: "pending" },
    saveJobs: { status: "pending" },
    generateResumes: { status: "pending", progress: 0 }
  }
}

export const useResumeGenerationStore = create<ResumeGenerationStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Data setters
      setJobs: (jobs) => set({ jobs }),
      setSessionId: (sessionId) => set({ sessionId }),
      setBaseResumeData: (content, file, years, language) =>
        set({
          baseResumeContent: content,
          baseResumeFile: file,
          yearsOfExperience: years,
          language
        }),

      // Generation state
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setNavigatedFromBulkGenerator: (navigated) =>
        set({ isNavigatedFromBulkGenerator: navigated }),
      updateJobGenerationState: (jobId, state) =>
        set((store) => ({
          generationProgress: {
            ...store.generationProgress,
            [jobId]: {
              ...store.generationProgress[jobId],
              id: jobId,
              status: "pending",
              progress: 0,
              ...state
            }
          }
        })),
      setOverallProgress: (progress) => set({ overallProgress: progress }),

      // Credit confirmation
      setCreditConfirmation: (confirmation) =>
        set((store) => ({
          creditConfirmation: {
            ...store.creditConfirmation,
            ...confirmation
          }
        })),

      // Background process
      setBackgroundProcessId: (id) => set({ backgroundProcessId: id }),
      setSetupComplete: (complete) => set({ setupComplete: complete }),
      updateApiCallStatus: (apiCall, status) =>
        set((store) => ({
          apiCalls: {
            ...store.apiCalls,
            [apiCall]: {
              ...store.apiCalls[apiCall],
              ...status
            }
          }
        })),

      // Reset/cleanup
      resetStore: () => set(initialState),
      clearGenerationData: () =>
        set((store) => ({
          ...store,
          isGenerating: false,
          isNavigatedFromBulkGenerator: false,
          generationProgress: {},
          overallProgress: 0,
          backgroundProcessId: null,
          setupComplete: false,
          apiCalls: {
            uploadResume: { status: "pending" },
            saveJobs: { status: "pending" },
            generateResumes: { status: "pending", progress: 0 }
          }
        }))
    }),
    {
      name: "resume-generation-store",
      // Only persist certain fields, not file objects or functions
      partialize: (state) => ({
        jobs: state.jobs,
        sessionId: state.sessionId,
        baseResumeContent: state.baseResumeContent,
        yearsOfExperience: state.yearsOfExperience,
        language: state.language,
        isGenerating: state.isGenerating,
        isNavigatedFromBulkGenerator: state.isNavigatedFromBulkGenerator,
        generationProgress: state.generationProgress,
        overallProgress: state.overallProgress,
        creditConfirmation: state.creditConfirmation,
        backgroundProcessId: state.backgroundProcessId,
        setupComplete: state.setupComplete,
        apiCalls: state.apiCalls
      })
    }
  )
)

// Selector hooks for better performance - use individual selectors to avoid object creation
export const useIsGenerating = () =>
  useResumeGenerationStore((state) => state.isGenerating)

export const useOverallProgress = () =>
  useResumeGenerationStore((state) => state.overallProgress)

export const useGenerationProgress = () =>
  useResumeGenerationStore((state) => state.generationProgress)

export const useCreditConfirmation = () =>
  useResumeGenerationStore((state) => state.creditConfirmation)

export const useStoreJobs = () =>
  useResumeGenerationStore((state) => state.jobs)

export const useSessionId = () =>
  useResumeGenerationStore((state) => state.sessionId)

export const useBaseResumeContent = () =>
  useResumeGenerationStore((state) => state.baseResumeContent)

export const useYearsOfExperience = () =>
  useResumeGenerationStore((state) => state.yearsOfExperience)

export const useLanguage = () =>
  useResumeGenerationStore((state) => state.language)

export const useBackgroundProcessId = () =>
  useResumeGenerationStore((state) => state.backgroundProcessId)

export const useApiCalls = () =>
  useResumeGenerationStore((state) => state.apiCalls)

export const useIsNavigatedFromBulkGenerator = () =>
  useResumeGenerationStore((state) => state.isNavigatedFromBulkGenerator)

export const useSetupComplete = () =>
  useResumeGenerationStore((state) => state.setupComplete)

// Utility function to clear store when process completes
export const clearResumeGenerationStore = () => {
  const store = useResumeGenerationStore.getState()
  store.clearGenerationData()
}
