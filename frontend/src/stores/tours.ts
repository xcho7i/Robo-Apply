// FILE: src/stores/tours.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { QUICK_LIST, FULL_GROUPS } from "./checklistItems"

/** A single tour step (route-aware) */
export type TourStep = {
  id: string
  title: string
  content: string
  target?: string
  route?: string
  scroll?: "center" | "start"
  onEnter?: () => void
}

/* -------------------- STEP GROUPS -------------------- */
export const sidebarEntrySteps: TourStep[] = [
  { id: "sb_sidebar", target: "[data-tour='sidebar']", title: "Navigation Sidebar", content: "From here you can open all modules." },
  { id: "rm_nav", route: "/resume-manager", target: "[data-tour='nav-resume-manager']", title: "Resume Manager", content: "This is your starting point to upload, view, and manage resume profiles efficiently.", scroll: "start" },
]

export const resumeManagerSteps: TourStep[] = [
  { id: "rm_upload", route: "/resume-manager", target: "[data-tour='rm-upload-btn']", title: "Upload Resume", content: "Upload a new resume from here.", scroll: "center" },
  { id: "rm_workspace", route: "/resume-manager", target: "[data-tour='rm-workspace']", title: "Edit your resumes/CV's", content: "This is the full workspace area — both heading and content.", scroll: "start" },
]

export const autoApplySteps: TourStep[] = [
  { id: "sb_nav_auto", target: "[data-tour='nav-autoapply']", title: "AutoApply", content: "Now let's open AutoApply.", route: "/auto-apply" },
  { id: "aa_overview", route: "/auto-apply", target: "[data-tour='overview-section']", title: "Overview", content: "Daily limit, plan progress, totals.", scroll: "center" },
  { id: "aa_start", route: "/auto-apply", target: "[data-tour='start-applying-section']", title: "Start Applying Jobs", content: "Apply filters and press the purple button.", scroll: "center" },
  { id: "aa_platforms", route: "/auto-apply", target: "[data-tour='integrated-platforms-block']", title: "Integrated Platforms", content: "Connect LinkedIn, Indeed, ZipRecruiter, Dice, Monster, SimplyHired.", scroll: "start" },
]

/* -------------------- AI Steps -------------------- */
// helpers
const isStepTargetVisible = (target: string): boolean => {
  const el = document.querySelector(target) as HTMLElement
  if (!el) return false
  const style = window.getComputedStyle(el)
  return style.display !== "none" && style.visibility !== "hidden" && el.offsetHeight > 0
}
const isDropdownItem = (target: string): boolean =>
  target.includes("nav-aitailored-") && !target.includes("nav-aitailored\"]")

export const aiTailoredSubmenuSteps: TourStep[] = [
  {
    id: "ai_sub_parent",
    target: "[data-tour='nav-aitailored']",
    title: "AI Tailored Apply",
    content: "Click here to open the dropdown to see more options, or we'll continue to the next section.",
    scroll: "center",
  },
  {
    id: "ai_sub_dashboard",
    target: "[data-tour='nav-aitailored-dashboard']",
    title: "AI Dashboard",
    content: "Go to the AI Tailored Dashboard to see recent jobs and quick actions.",
    route: "/initialize-resume-generation",
    scroll: "center",
  },
  {
    id: "ai_sub_single",
    target: "[data-tour='nav-aitailored-single']",
    title: "Single Tailored Resume",
    content: "Generate a tailored resume for a single job.",
    route: "/ai-single-resume-generator",
    scroll: "center",
  },
  {
    id: "ai_sub_bulk",
    target: "[data-tour='nav-aitailored-bulk']",
    title: "Bulk Tailored Resume",
    content: "Generate resumes in bulk by uploading a CSV.",
    route: "/ai-bulk-resume-generator",
    scroll: "center",
  },
]

export const aiDashboardPageSteps: TourStep[] = [
  {
    id: "ai_dash_heading",
    route: "/initialize-resume-generation",
    target: "[data-tour='ai-dash-heading']",
    title: "Resume Dashboard Overview",
    content: "Get a quick view of all your saved resumes and create job-specific versions with ease.",
    scroll: "center",
  },
  {
    id: "ai_dash_total",
    route: "/initialize-resume-generation",
    target: "[data-tour='ai-dash-total']",
    title: "Total Resumes",
    content: "View total resumes, improvement stats, top scores, and ready-to-apply resumes — all in one place.",
    scroll: "center",
  },
  {
    id: "ai_dash_filter",
    route: "/initialize-resume-generation",
    target: "[data-tour='ai-dash-filter']",
    title: "Filter by Status",
    content: "Filter resumes by their status, such as Completed, Pending, and more, to manage them efficiently.",
    scroll: "center",
  },
  {
    id: "ai_dash_generate",
    route: "/initialize-resume-generation",
    target: "[data-tour='ai-dash-generate']",
    title: "Generate Selected",
    content: "Click here to generate resumes for the selected jobs.",
    scroll: "center",
  },
]

// /ai-single-resume-generator
export const aiSingleSteps: TourStep[] = [
  {
    id: "ai_single_upload",
    route: "/ai-single-resume-generator",
    target: "[data-tour='ai-single-uploadResume']",
    title: "Upload Resume",
    content: "Add your resume to start analyzing, editing, or creating tailored versions.",
    scroll: "center",
  },
  {
    id: "ai_single_tech",
    route: "/ai-single-resume-generator",
    target: "[data-tour='ai-single-techInfo']",
    title: "Add Info",
    content: "Paste the job link or enter the job description.",
    scroll: "center",
  },
  {
    id: "ai_single_settings",
    route: "/ai-single-resume-generator",
    target: "[data-tour='ai-single-coreSettings']",
    title: "Core Settings",
    content: "Choose your preferred language and set your experience level to tailor resume suggestions.",
    scroll: "center",
  },
]

// /ai-bulk-resume-generator
export const aiBulkSteps: TourStep[] = [
  {
    id: "ai_bulk_upload",
    route: "/ai-bulk-resume-generator",
    target: "[data-tour='ai-bulk-upload']",
    title: "Upload CSV",
    content: "Upload a CSV — the job list will come from here.",
    scroll: "center",
  },
  {
    id: "ai_bulk_mapping",
    route: "/ai-bulk-resume-generator",
    target: "[data-tour='ai-bulk-mapping']",
    title: "Column Mapping",
    content: "Map CSV columns to the fields.",
    scroll: "center",
  },
  {
    id: "ai_bulk_start",
    route: "/ai-bulk-resume-generator",
    target: "[data-tour='ai-bulk-start']",
    title: "Start Generation",
    content: "All set? Now start the bulk generation.",
    scroll: "center",
  },
]

// Resume Builder Steps - CORRECT ROUTE
export const aiResumeBuilder: TourStep[] = [
  {
    id: "ai_res_builder_nav",
    route: "/scan-resume/main-ResumeBuilder",
    target: "[data-tour='ai-res-builder-resumeNav']",
    title: "AI Resume Builder",
    content: "Build professional, job-ready resumes instantly with AI-generated content tailored to your profile.",
    scroll: "center",
  },
  {
    id: "ai_res_builder_heading",
    route: "/scan-resume/main-ResumeBuilder",
    target: "[data-tour='ai-res-builder-resumeHeading']",
    title: "AI Resume Builder",
    content: "Generate personalized, job-ready resumes instantly with AI assistance.",
    scroll: "center",
  },
  {
    id: "ai_res_builder_add",
    route: "/scan-resume/main-ResumeBuilder",
    target: "[data-tour='ai-res-builder-addNewRes']",
    title: "New Resume",
    content: "Create a fresh resume from scratch using guided AI tools.",
    scroll: "center",
  },
  {
    id: "ai_res_builder_create",
    route: "/scan-resume/main-ResumeBuilder",
    target: "[data-tour='ai-res-builder-creatResBtn']",
    title: "Create Resume First",
    content: "Start by building your resume to unlock editing and customization features.",
    scroll: "center",
  },
]

export const aiCoverLetter: TourStep[] = [
  {
    id: "ai_cover_heading",
    route: "/main-coverletter",
    target: "[data-tour='ai-coverletter-cvrLtrHeading']",
    title: "My Cover Letters",
    content: "View, edit, and share your saved cover letters in one place.",
    scroll: "center",
  },
  {
    id: "ai_cover_add",
    route: "/main-coverletter",
    target: "[data-tour='ai-coverletter-addNewCvrLtr']",
    title: "New Cover Letter",
    content: "Start writing a new cover letter tailored to your job application.",
    scroll: "center",
  },
  {
    id: "ai_cover_create",
    route: "/main-coverletter",
    target: "[data-tour='ai-coverletter-createCvrLtr']",
    title: "Create Cover Letter First",
    content: "Build your first cover letter to enable editing and sharing options.",
    scroll: "center",
  },
]

export const aiResumeScore: TourStep[] = [
  {
    id: "ai_scan_heading",
    route: "/scan",
    target: "[data-tour='ai-scan-heading']",
    title: "Create New Scan",
    content: "Start a new AI scan to analyze and score your resume.",
    scroll: "center",
  },
  {
    id: "ai_scan_generate",
    route: "/scan",
    target: "[data-tour='ai-scan-generateBtn']",
    title: "Generate Score",
    content: "Run the AI scan to evaluate your resume and get improvement suggestions.",
    scroll: "center",
  },
  {
    id: "ai_scan_drag",
    route: "/scan",
    target: "[data-tour='ai-scan-dragResume']",
    title: "Upload Resume for Scan",
    content: "Drag and drop your resume to analyze its quality, relevance, and score instantly.",
    scroll: "center",
  },
]

export const aiInterviewGuid: TourStep[] = [
  {
    id: "ai_interview_heading",
    route: "/main-interview-Guide",
    target: "[data-tour='ai-interviewGuid-interviewHeading']",
    title: "AI Interview Guide",
    content: "Get personalized interview questions and tips based on your resume and job role.",
    scroll: "center",
  },
  {
    id: "ai_interview_new",
    route: "/main-interview-Guide",
    target: "[data-tour='ai-interviewGuid-newInterviewGuid']",
    title: "New Interview Guide",
    content: "Generate a fresh AI-based interview guide tailored to your resume and role.",
    scroll: "center",
  },
  {
    id: "ai_interview_create",
    route: "/main-interview-Guide",
    target: "[data-tour='ai-interviewGuid-createInterviewGuidBtn']",
    title: "Create Interview Guide",
    content: "Build your first AI-powered interview guide to start preparing confidently.",
    scroll: "center",
  },
]

// interview copilot
export const aiInterviewCopilot: TourStep[] = [
  {
    id: "ai_analytics_session",
    route: "/analytics",
    target: "[data-tour='ai-copilot-nav']",
    title: "AI Interview Copilot",
    content: "Practice job-specific interview questions, get instant feedback, and improve your answers with real-time AI support.",
    scroll: "center",
  },

]

// Analytics
export const aiAnalytics: TourStep[] = [
  {
    id: "ai_analytics_session",
    route: "/analytics",
    target: "[data-tour='ai-analytics-sessionDetails']",
    title: "Analytics",
    content: "Track views, applications, and session details like visit time and duration.",
    scroll: "center",
  },
  {
    id: "ai_analytics_sessionBtn",
    route: "/analytics",
    target: "[data-tour='ai-analytics-sessionDetailsBtn']",
    title: "Session Details",
    content: "View detailed analytics of your job application sessions and performance metrics.",
    scroll: "center",
  },
  {
    id: "ai_analytics_platform",
    route: "/analytics",
    target: "[data-tour='ai-analytics-checkPlatform']",
    title: "Platform Check",
    content: "Check performance across different job platforms and optimize your strategy.",
    scroll: "center",
  },
  {
    id: "ai_analytics_day",
    route: "/analytics",
    target: "[data-tour='ai-analytics-checkSessionDay']",
    title: "Session Day Check",
    content: "Monitor your daily application activity and track progress over time.",
    scroll: "center",
  },
]

// Settings
export const settings: TourStep[] = [
  {
    id: "settings_upgrade",
    route: "/billing",
    target: "[data-tour='ai-settings-UpgradePlan']",
    title: "Upgrade Plan",
    content: "Unlock premium features by upgrading to a higher plan.",
    scroll: "center",
  },
]

export const fullTourSteps: TourStep[] = [
  ...sidebarEntrySteps,
  ...resumeManagerSteps,
  ...autoApplySteps,
  { ...aiTailoredSubmenuSteps[0] },
  ...aiTailoredSubmenuSteps.slice(1),
  ...aiDashboardPageSteps,
  ...aiSingleSteps,
  ...aiBulkSteps,
  ...aiResumeBuilder,
  ...aiCoverLetter,
  ...aiResumeScore,
  ...aiInterviewGuid,
  ...aiInterviewCopilot,
  ...aiAnalytics,
  ...settings,
]

/* -------------------- Checklist Mapping -------------------- */
export const mapStepToChecklist = (stepId: string): string | null => {
  if (stepId === "rm_upload") return "resume-manager-upload"
  if (stepId === "rm_workspace") return "resume-manager-save"
  if (stepId === "aa_start") return "auto-apply-20"
  if (stepId === "aa_overview" || stepId === "sb_nav_auto") return "auto-apply-link"
  if (stepId === "ai_single_upload" || stepId === "ai_bulk_upload") return "ai-tailored-upload"
  if (stepId === "ai_single_settings" || stepId === "ai_bulk_mapping") return "ai-tailored-run"
  if (stepId === "ai_res_builder_add") return "ai-resume-history"
  if (stepId === "ai_res_builder_create") return "ai-resume-create"
  if (stepId === "ai_cover_heading") return "ai-cover-upload"
  if (stepId === "ai_cover_add" || stepId === "ai_cover_create") return "ai-cover-generate"
  if (stepId === "ai_scan_drag") return "resume-score-upload"
  if (stepId === "ai_scan_generate") return "resume-score-generate"
  if (stepId === "ai_interview_heading") return "ai-guide-upload"
  if (stepId === "ai_interview_new" || stepId === "ai_interview_create") return "ai-guide-questions"
  if (stepId.startsWith("ai_interview")) return "ai-guide-mock"
  if (stepId === "ai_copilot_start") return "ai-guide-mock"
  if (stepId === "ai_copilot_transcribe") return "ai-guide-mock"
  if (stepId === "ai_analytics_session") return "analytics-session"
  if (stepId === "ai_analytics_platform" || stepId === "ai_analytics_day") return "analytics-report"
  if (stepId === "settings_upgrade") return "settings-plan"
  return null
}

/* -------------------- Module Keys -------------------- */
export type ModuleKey =
  | "group"
  | "resume-manager"
  | "auto-apply"
  | "initialize-resume-generation"
  | "ai-single-resume-generator"
  | "ai-bulk-resume-generator"
  | "ai-resume-builder"
  | "main-coverletter"
  | "ai-resume-score"
  | "ai-interview-guide"
  | "analytics"
  | "settings"

type TourStatus = "new" | "seen" | "skipped" | "done"
const WELCOME_KEY = "ra_welcome_shown"
const ANY_SKIP_KEY = "ra_any_skip"

const statusKeyFor = (k: string) => `ra_tour_${k}_status`
const getStatus = (k: ModuleKey): TourStatus =>
  (localStorage.getItem(statusKeyFor(k)) as TourStatus) || "new"
const setStatus = (k: ModuleKey, s: TourStatus) => localStorage.setItem(statusKeyFor(k), s)
const setAnySkip = () => localStorage.setItem(ANY_SKIP_KEY, "1")
const hasAnySkip = () => Boolean(localStorage.getItem(ANY_SKIP_KEY))

/* -------------------- Store -------------------- */
type TourState = {
  welcomeOpen: boolean
  started: boolean
  dismissed: boolean
  currentIndex: number
  steps: TourStep[]
  checklist: Record<string, boolean>

  activeFlow?: "group" | "module"
  activeModuleKey?: ModuleKey | null

  // Debug methods
  debugTourState: () => void
  forceModuleTour: (moduleKey: ModuleKey, steps: TourStep[]) => void

  // ✅ checklist
  setChecklist: (list: Record<string, boolean>) => void
  toggleItem: (id: string) => void
  autoCheckItem: (id: string) => void

  // ✅ navigation + location
  nav?: (path: string) => void
  setNavigator: (fn: (path: string) => void) => void
  getLocation?: () => string
  setLocationGetter: (fn: () => string) => void

  // ✅ flow control
  setSteps: (steps: TourStep[]) => void
  openWelcome: () => void
  start: () => void
  skip: () => void
  reset: () => void
  next: () => void
  prev: () => void
  setIndex: (i: number) => void
  markDone: (id: string) => void

  // ✅ tour orchestration
  initToursOnAppLoad: () => void
  startModuleTourIfEligible: (
    moduleKey: ModuleKey,
    steps: TourStep[],
    opts?: { showWelcome?: boolean }
  ) => void

  // ✅ backward compatibility
  openOnFirstVisit: (
    key: string,
    cfg?: { steps?: TourStep[]; showWelcome?: boolean } | TourStep[]
  ) => void
  resetFor: (moduleKey: string) => void
}

export const useTour = create<TourState>()(
  persist(
    (set, get) => {
      const goToRouteIfNeeded = (step?: TourStep) => {
        const s = get()
        if (step?.route && s.getLocation && s.getLocation() !== step.route) {
          s.nav?.(step.route)
        }
      }

      // Helper function to auto-check checklist items
      const autoCheckForStep = (step: TourStep) => {
        const checklistId = mapStepToChecklist(step.id)
        if (checklistId) {
          const s = get()
          if (!s.checklist[checklistId]) {
            s.autoCheckItem(checklistId)
          }
        }
      }

      return {
        welcomeOpen: false,
        started: false,
        dismissed: false,
        currentIndex: 0,
        steps: [],
        checklist: {},
        activeFlow: undefined,
        activeModuleKey: null,

        // DEBUG METHODS
        debugTourState: () => {
          const state = get()
          console.log("🔍 TOUR DEBUG STATE:", {
            welcomeOpen: state.welcomeOpen,
            started: state.started,
            dismissed: state.dismissed,
            activeFlow: state.activeFlow,
            activeModuleKey: state.activeModuleKey,
            currentIndex: state.currentIndex,
            stepsLength: state.steps.length,
            groupStatus: getStatus("group"),
            resumeBuilderStatus: getStatus("ai-resume-builder"),
            hasAnySkip: hasAnySkip(),
            currentLocation: state.getLocation?.(),
          })
        },

        forceModuleTour: (moduleKey, steps) => {
          set({
            steps,
            activeFlow: "module",
            activeModuleKey: moduleKey,
            welcomeOpen: false,
            started: true,
            dismissed: false,
            currentIndex: 0,
          })
          goToRouteIfNeeded(steps[0])
          // Auto-check first step
          if (steps[0]) autoCheckForStep(steps[0])
        },

        setChecklist: (list) => set({ checklist: list }),
        toggleItem: (id) =>
          set((s) => ({ checklist: { ...s.checklist, [id]: !s.checklist[id] } })),
        
        autoCheckItem: (id) =>
          set((s) => ({ checklist: { ...s.checklist, [id]: true } })),

        setNavigator: (fn) => set({ nav: fn }),
        setLocationGetter: (fn) => set({ getLocation: fn }),

        setSteps: (steps) => set({ steps }),
        openWelcome: () => set({ welcomeOpen: true, dismissed: false }),

        start: () => {
          const s = get()
          set({ started: true, welcomeOpen: false })
          goToRouteIfNeeded(s.steps[0])
          // Auto-check first step when tour starts
          if (s.steps[0]) autoCheckForStep(s.steps[0])
        },

        reset: () => set({ started: false, dismissed: false, currentIndex: 0 }),

        skip: () => set((s) => {
          setAnySkip()
          if (s.activeModuleKey) setStatus(s.activeModuleKey, "skipped")
          return { started: false, dismissed: true, welcomeOpen: false, currentIndex: 0 }
        }),

        next: () => set((s) => {
          const nextIndex = s.currentIndex + 1
          if (nextIndex >= s.steps.length) {
            if (s.activeModuleKey) setStatus(s.activeModuleKey, "done")
            return { started: false, currentIndex: 0 }
          }
          goToRouteIfNeeded(s.steps[nextIndex])
          // Auto-check next step
          if (s.steps[nextIndex]) autoCheckForStep(s.steps[nextIndex])
          return { currentIndex: nextIndex }
        }),

        prev: () => set((s) => {
          const prevIndex = Math.max(0, s.currentIndex - 1)
          goToRouteIfNeeded(s.steps[prevIndex])
          return { currentIndex: prevIndex }
        }),

        setIndex: (i) => {
          const s = get()
          set({ currentIndex: i })
          goToRouteIfNeeded(s.steps[i])
          // Auto-check when index is set
          if (s.steps[i]) autoCheckForStep(s.steps[i])
        },

        markDone: (id) => {
          // Your existing checklist logic
        },

        initToursOnAppLoad: () => {
          
          // Only show group tour if no skips and group tour is new
          if (!hasAnySkip() && getStatus("group") === "new") {
            const showWelcome = !localStorage.getItem(WELCOME_KEY)
            if (showWelcome) localStorage.setItem(WELCOME_KEY, "1")
            
            setStatus("group", "seen")
            set({
              steps: fullTourSteps,
              activeFlow: "group",
              activeModuleKey: "group",
              welcomeOpen: showWelcome,
              started: !showWelcome,
              dismissed: false,
              currentIndex: 0,
            })
            
            const firstStep = get().steps[0]
            goToRouteIfNeeded(firstStep)
            // Auto-check first step if tour starts immediately
            if (!showWelcome && firstStep) autoCheckForStep(firstStep)
            
          } else {
            console.log("❌ Group tour conditions not met:", {
              hasAnySkip: hasAnySkip(),
              groupStatus: getStatus("group")
            })
          }
        },

        startModuleTourIfEligible: (moduleKey, steps, opts) => {
          
          // Don't show module tours if it's the group module
          if (moduleKey === "group" || !steps?.length) {
            console.log("❌ Invalid module or no steps")
            return
          }
          
          // RELAXED CONDITIONS - Show if:
          // 1. Group tour has been interacted with (seen, skipped, or done) OR
          // 2. User has skipped any tour before
          const groupStatus = getStatus("group")
          const moduleStatus = getStatus(moduleKey)
          
          console.log("📊 Tour Status Check:", {
            groupStatus,
            moduleStatus,
            hasAnySkip: hasAnySkip()
          })
          
          // Don't show if this specific module tour is already done
          if (moduleStatus === "done") {
            console.log("❌ Module already completed")
            return
          }
          
          // Show tour if group has been seen/skipped OR if any skip exists
          const canShowTour = groupStatus !== "new" || hasAnySkip()
          
          if (!canShowTour) {
            console.log("❌ Cannot show tour - group tour hasn't been initiated")
            return
          }

          const showWelcome = opts?.showWelcome ?? false
          setStatus(moduleKey, "seen")
          
          set({
            steps,
            activeFlow: "module",
            activeModuleKey: moduleKey,
            welcomeOpen: showWelcome,
            started: !showWelcome,
            dismissed: false,
            currentIndex: 0,
          })
          
          // Only navigate if welcome is not shown
          if (!showWelcome) {
            goToRouteIfNeeded(steps[0])
            // Auto-check first step when module tour starts
            if (steps[0]) autoCheckForStep(steps[0])
          }
        },

        openOnFirstVisit: (key, cfg) => {
          const k = key as ModuleKey
          let steps: TourStep[] | undefined
          let wantWelcome = true
          if (Array.isArray(cfg)) steps = cfg
          else if (cfg) {
            steps = cfg.steps
            if (typeof cfg.showWelcome === "boolean") wantWelcome = cfg.showWelcome
          }
          if (!steps?.length) return

          const canWelcome = wantWelcome && !localStorage.getItem(WELCOME_KEY)
          if (canWelcome) localStorage.setItem(WELCOME_KEY, "1")

          set({
            steps,
            activeFlow: k === "group" ? "group" : "module",
            activeModuleKey: k,
            welcomeOpen: !!canWelcome,
            started: !canWelcome,
            dismissed: false,
            currentIndex: 0,
          })
          
          const firstStep = get().steps[0]
          goToRouteIfNeeded(firstStep)
          // Auto-check first step if tour starts immediately
          if (!canWelcome && firstStep) autoCheckForStep(firstStep)
        },

        resetFor: (moduleKey) => {
          localStorage.removeItem(statusKeyFor(moduleKey))
          set({ started: false, dismissed: false, currentIndex: 0 })
        },
      }
    },
    { name: "onboarding_checklist_store", partialize: (s) => ({ checklist: s.checklist }) }
  )
)