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
  checklistItem?: string // ✅ Direct mapping to checklist item
}

/* -------------------- STEP GROUPS -------------------- */
export const sidebarEntrySteps: TourStep[] = [
  { 
    id: "sb_sidebar", 
    target: "[data-tour='sidebar']", 
    title: "Navigation Sidebar", 
    content: "From here you can open all modules." 
  },
  { 
    id: "rm_nav", 
    route: "/resume-manager", 
    target: "[data-tour='nav-resume-manager']", 
    title: "Resume Manager", 
    content: "This is your starting point to upload, view, and manage resume profiles efficiently.", 
    scroll: "start" 
  },
]

// ✅ Enhanced Resume Manager Steps with checklist mapping
export const resumeManagerSteps: TourStep[] = [
  { 
    id: "rm_upload", 
    route: "/resume-manager", 
    target: "[data-tour='rm-upload-btn']", 
    title: "Upload Resume", 
    content: "Upload a new resume from here to get started with your profile management.", 
    scroll: "center",
    checklistItem: "resume-manager-upload"
  },
  { 
    id: "rm_workspace", 
    route: "/resume-manager", 
    target: "[data-tour='rm-workspace']", 
    title: "Edit your resumes/CV's", 
    content: "This is the full workspace area — both heading and content. Save your changes here.", 
    scroll: "start",
    checklistItem: "resume-manager-save"
  },
]

// ✅ Enhanced Auto Apply Steps
export const autoApplySteps: TourStep[] = [
  { 
    id: "sb_nav_auto", 
    target: "[data-tour='nav-autoapply']", 
    title: "AutoApply", 
    content: "Now let's open AutoApply to start automated job applications.", 
    route: "/auto-apply",
    checklistItem: "auto-apply-link"
  },
  { 
    id: "aa_overview", 
    route: "/auto-apply", 
    target: "[data-tour='overview-section']", 
    title: "Overview", 
    content: "Daily limit, plan progress, totals.", 
    scroll: "center" 
  },
  { 
    id: "aa_start", 
    route: "/auto-apply", 
    target: "[data-tour='start-applying-section']", 
    title: "Start Applying Jobs", 
    content: "Apply filters and press the purple button. Try to apply to at least 20 jobs!", 
    scroll: "center",
    checklistItem: "auto-apply-20"
  },
  { 
    id: "aa_platforms", 
    route: "/auto-apply", 
    target: "[data-tour='integrated-platforms-block']", 
    title: "Integrated Platforms", 
    content: "Connect LinkedIn, Indeed, ZipRecruiter, Dice, Monster, SimplyHired.", 
    scroll: "start" 
  },
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

// ✅ AI Dashboard Steps with checklist integration
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

// ✅ AI Single Resume Generator Steps
export const aiSingleSteps: TourStep[] = [
  {
    id: "ai_single_upload",
    route: "/ai-single-resume-generator",
    target: "[data-tour='ai-single-uploadResume']",
    title: "Upload Resume",
    content: "Add your resume to start analyzing, editing, or creating tailored versions.",
    scroll: "center",
    checklistItem: "ai-tailored-upload"
  },
  {
    id: "ai_single_tech",
    route: "/ai-single-resume-generator",
    target: "[data-tour='ai-single-techInfo']",
    title: "Add Job Info",
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
    checklistItem: "ai-tailored-run"
  },
]

// ✅ AI Bulk Resume Generator Steps
export const aiBulkSteps: TourStep[] = [
  {
    id: "ai_bulk_upload",
    route: "/ai-bulk-resume-generator",
    target: "[data-tour='ai-bulk-upload']",
    title: "Upload CSV",
    content: "Upload a CSV — the job list will come from here.",
    scroll: "center",
    checklistItem: "ai-tailored-upload"
  },
  {
    id: "ai_bulk_mapping",
    route: "/ai-bulk-resume-generator",
    target: "[data-tour='ai-bulk-mapping']",
    title: "Column Mapping",
    content: "Map CSV columns to the fields.",
    scroll: "center",
    checklistItem: "ai-tailored-run"
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

// ✅ AI Resume Builder Steps with checklist mapping
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
    content: "Create a fresh resume from scratch using guided AI tools. Check your resume history here.",
    scroll: "center",
    checklistItem: "ai-resume-history"
  },
  {
    id: "ai_res_builder_create",
    route: "/scan-resume/main-ResumeBuilder",
    target: "[data-tour='ai-res-builder-creatResBtn']",
    title: "Create Resume First",
    content: "Start by building your resume to unlock editing and customization features.",
    scroll: "center",
    checklistItem: "ai-resume-create"
  },
]

// ✅ AI Cover Letter Steps
export const aiCoverLetter: TourStep[] = [
  {
    id: "ai_cover_heading",
    route: "/main-coverletter",
    target: "[data-tour='ai-coverletter-cvrLtrHeading']",
    title: "My Cover Letters",
    content: "View, edit, and share your saved cover letters in one place.",
    scroll: "center",
    checklistItem: "ai-cover-upload"
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
    checklistItem: "ai-cover-generate"
  },
]

// ✅ AI Resume Score Steps
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
    id: "ai_scan_drag",
    route: "/scan",
    target: "[data-tour='ai-scan-dragResume']",
    title: "Upload Resume for Scan",
    content: "Drag and drop your resume to analyze its quality, relevance, and score instantly.",
    scroll: "center",
    checklistItem: "resume-score-upload"
  },
  {
    id: "ai_scan_generate",
    route: "/scan",
    target: "[data-tour='ai-scan-generateBtn']",
    title: "Generate Score",
    content: "Run the AI scan to evaluate your resume and get improvement suggestions.",
    scroll: "center",
    checklistItem: "resume-score-generate"
  },
]

// ✅ AI Interview Guide Steps
export const aiInterviewGuid: TourStep[] = [
  {
    id: "ai_interview_heading",
    route: "/main-interview-Guide",
    target: "[data-tour='ai-interviewGuid-interviewHeading']",
    title: "AI Interview Guide",
    content: "Get personalized interview questions and tips based on your resume and job role.",
    scroll: "center",
    checklistItem: "ai-guide-upload"
  },
  {
    id: "ai_interview_new",
    route: "/main-interview-Guide",
    target: "[data-tour='ai-interviewGuid-newInterviewGuid']",
    title: "New Interview Guide",
    content: "Generate a fresh AI-based interview guide tailored to your resume and role.",
    scroll: "center",
    checklistItem: "ai-guide-questions"
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

// ✅ AI Interview Copilot Steps
export const aiInterviewCopilot: TourStep[] = [
  {
    id: "ai_copilot_nav",
    route: "/analytics",
    target: "[data-tour='ai-copilot-nav']",
    title: "AI Interview Copilot",
    content: "Practice job-specific interview questions, get instant feedback, and improve your answers with real-time AI support.",
    scroll: "center",
    checklistItem: "ai-guide-mock"
  },
]

// ✅ Analytics Steps
export const aiAnalytics: TourStep[] = [
  {
    id: "ai_analytics_session",
    route: "/analytics",
    target: "[data-tour='ai-analytics-sessionDetails']",
    title: "Analytics Dashboard",
    content: "Track views, applications, and session details like visit time and duration.",
    scroll: "center",
    checklistItem: "analytics-session"
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
    checklistItem: "analytics-report"
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

// ✅ Settings Steps
export const settings: TourStep[] = [
  {
    id: "settings_upgrade",
    route: "/billing",
    target: "[data-tour='ai-settings-UpgradePlan']",
    title: "Upgrade Plan",
    content: "Unlock premium features by upgrading to a higher plan.",
    scroll: "center",
    checklistItem: "settings-plan"
  },
]

// ✅ Complete tour flow
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

/* -------------------- Enhanced Checklist Mapping -------------------- */
export const mapStepToChecklist = (stepId: string): string | null => {
  // ✅ Find step by ID and return its checklistItem if available
  const step = fullTourSteps.find(s => s.id === stepId)
  if (step?.checklistItem) {
    return step.checklistItem
  }

  // ✅ Fallback mapping for backwards compatibility
  const legacyMapping: Record<string, string> = {
    "rm_upload": "resume-manager-upload",
    "rm_workspace": "resume-manager-save",
    "sb_nav_auto": "auto-apply-link",
    "aa_start": "auto-apply-20",
    "ai_single_upload": "ai-tailored-upload",
    "ai_bulk_upload": "ai-tailored-upload", 
    "ai_single_settings": "ai-tailored-run",
    "ai_bulk_mapping": "ai-tailored-run",
    "ai_res_builder_add": "ai-resume-history",
    "ai_res_builder_create": "ai-resume-create",
    "ai_cover_heading": "ai-cover-upload",
    "ai_cover_create": "ai-cover-generate",
    "ai_scan_drag": "resume-score-upload",
    "ai_scan_generate": "resume-score-generate",
    "ai_interview_heading": "ai-guide-upload",
    "ai_interview_new": "ai-guide-questions",
    "ai_interview_mock": "ai-guide-mock",
    "ai_copilot_nav": "ai-guide-mock",
    "ai_analytics_session": "analytics-session",
    "ai_analytics_platform": "analytics-report",
    "settings_upgrade": "settings-plan"
  }

  return legacyMapping[stepId] || null
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

// ✅ Enhanced Module Steps Mapping
export const getModuleSteps = (moduleKey: ModuleKey): TourStep[] => {
  const moduleStepsMap: Record<ModuleKey, TourStep[]> = {
    "group": fullTourSteps,
    "resume-manager": resumeManagerSteps,
    "auto-apply": autoApplySteps,
    "initialize-resume-generation": aiDashboardPageSteps,
    "ai-single-resume-generator": aiSingleSteps,
    "ai-bulk-resume-generator": aiBulkSteps,
    "ai-resume-builder": aiResumeBuilder,
    "main-coverletter": aiCoverLetter,
    "ai-resume-score": aiResumeScore,
    "ai-interview-guide": aiInterviewGuid,
    "analytics": aiAnalytics,
    "settings": settings,
  }
  
  return moduleStepsMap[moduleKey] || []
}

type TourStatus = "new" | "seen" | "skipped" | "done"
const WELCOME_KEY = "ra_welcome_shown"
const ANY_SKIP_KEY = "ra_any_skip"
const TOUR_STARTED_KEY = "ra_tour_ever_started"

const statusKeyFor = (k: string) => `ra_tour_${k}_status`
const getStatus = (k: ModuleKey): TourStatus =>
  (localStorage.getItem(statusKeyFor(k)) as TourStatus) || "new"
const setStatus = (k: ModuleKey, s: TourStatus) =>
  localStorage.setItem(statusKeyFor(k), s)
const setAnySkip = () => localStorage.setItem(ANY_SKIP_KEY, "1")
const hasAnySkip = () => Boolean(localStorage.getItem(ANY_SKIP_KEY))
const hasTourEverStarted = () => Boolean(localStorage.getItem(TOUR_STARTED_KEY))

/* -------------------- Enhanced Store -------------------- */
type TourState = {
  welcomeOpen: boolean
  started: boolean
  dismissed: boolean
  currentIndex: number
  steps: TourStep[]
  checklist: Record<string, boolean>

  activeFlow?: "group" | "module"
  activeModuleKey?: ModuleKey | null

  // ✅ Enhanced methods
  debugTourState: () => void
  forceModuleTour: (moduleKey: ModuleKey, steps: TourStep[]) => void
  switchToModuleTour: (moduleKey: ModuleKey, steps: TourStep[], path: string) => void
  autoCheckStepItem: (stepId: string) => void // ✅ New method for auto-checking

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

  // ✅ tour orchestration - UPDATED to prevent module auto-tours
  initToursOnAppLoad: () => void
  startModuleTourIfEligible: (
    moduleKey: ModuleKey,
    steps: TourStep[],
    opts?: { showWelcome?: boolean }
  ) => void

  // ✅ backward compatibility - UPDATED to prevent welcome auto-show
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

      return {
        welcomeOpen: false,
        started: false,
        dismissed: false,
        currentIndex: 0,
        steps: [],
        checklist: {},
        activeFlow: undefined,
        activeModuleKey: null,

        debugTourState: () => {
          const state = get()
          console.log("🔍 TOUR DEBUG STATE:", {
            activeFlow: state.activeFlow,
            activeModuleKey: state.activeModuleKey,
            currentIndex: state.currentIndex,
            totalSteps: state.steps.length,
            started: state.started,
            checklist: state.checklist,
            tourEverStarted: hasTourEverStarted()
          })
        },

        // ✅ Enhanced auto-check method
        autoCheckStepItem: (stepId: string) => {
          const checklistId = mapStepToChecklist(stepId)
          if (checklistId) {
            const s = get()
            if (!s.checklist[checklistId]) {
              console.log(`✅ Auto-checking: ${checklistId} for step: ${stepId}`)
              set(state => ({
                checklist: { ...state.checklist, [checklistId]: true }
              }))
            }
          }
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
        },

        // ✅ Enhanced module tour switching
        switchToModuleTour: (moduleKey: ModuleKey, steps: TourStep[], path: string) => {
          const s = get()

          // 1️⃣ Mark current tour as skipped
          if (s.activeFlow === "group") {
            setAnySkip()
            setStatus("group", "skipped")
          } else if (s.activeModuleKey) {
            setStatus(s.activeModuleKey, "skipped")
          }

          // 2️⃣ Start new module tour
          set({
            steps,
            activeFlow: "module",
            activeModuleKey: moduleKey,
            welcomeOpen: false,
            started: true,
            dismissed: false,
            currentIndex: 0,
          })

          // 3️⃣ Navigate to module
          if (path && s.nav) {
            s.nav(path)
          }
        },

        setChecklist: (list) => set({ checklist: list }),
        
        toggleItem: (id) =>
          set((s) => ({
            checklist: { ...s.checklist, [id]: !s.checklist[id] },
          })),
          
        autoCheckItem: (id) =>
          set((s) => ({ 
            checklist: { ...s.checklist, [id]: true } 
          })),

        setNavigator: (fn) => set({ nav: fn }),
        setLocationGetter: (fn) => set({ getLocation: fn }),

        setSteps: (steps) => set({ steps }),
        openWelcome: () => set({ welcomeOpen: true, dismissed: false }),

        start: () => {
          const s = get()
          set({ started: true, welcomeOpen: false })
          goToRouteIfNeeded(s.steps[0])
        },

        reset: () => set({ 
          started: false, 
          dismissed: false, 
          currentIndex: 0,
          activeFlow: undefined,
          activeModuleKey: null 
        }),

        skip: () =>
          set((s) => {
            setAnySkip()
            if (s.activeModuleKey) setStatus(s.activeModuleKey, "skipped")
            return {
              started: false,
              dismissed: true,
              welcomeOpen: false,
              currentIndex: 0,
              activeFlow: undefined,
              activeModuleKey: null
            }
          }),

        next: () =>
          set((s) => {
            const nextIndex = s.currentIndex + 1
            
            // ✅ Auto-check current step before moving to next
            const currentStep = s.steps[s.currentIndex]
            if (currentStep?.checklistItem && !s.checklist[currentStep.checklistItem]) {
              get().autoCheckItem(currentStep.checklistItem)
            }
            
            if (nextIndex >= s.steps.length) {
              // ✅ Tour completed
              if (s.activeModuleKey && s.activeModuleKey !== "group") {
                setStatus(s.activeModuleKey, "done")
              }
              return { 
                started: false, 
                currentIndex: 0,
                activeFlow: undefined,
                activeModuleKey: null
              }
            }
            
            goToRouteIfNeeded(s.steps[nextIndex])
            return { currentIndex: nextIndex }
          }),

        prev: () =>
          set((s) => {
            const prevIndex = Math.max(0, s.currentIndex - 1)
            goToRouteIfNeeded(s.steps[prevIndex])
            return { currentIndex: prevIndex }
          }),

        setIndex: (i) => {
          const s = get()
          set({ currentIndex: i })
          goToRouteIfNeeded(s.steps[i])
        },

        markDone: (id) => {
          console.log("✅ Mark done:", id)
          // ✅ Auto-check related checklist item
          const checklistId = mapStepToChecklist(id)
          if (checklistId) {
            get().autoCheckItem(checklistId)
          }
        },

        // ✅ UPDATED - Only initialize if no tour has ever been started
        initToursOnAppLoad: () => {
          console.log("🚀 Initializing tours on app load...")
          
          // Don't auto-start if tour has ever been started
          if (hasTourEverStarted()) {
            console.log("⏭️ Tour has been started before, skipping auto-init")
            return
          }
          
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

            if (!showWelcome) {
              const firstStep = get().steps[0]
              goToRouteIfNeeded(firstStep)
            }
            
            console.log("🎯 Group tour initialized")
          }
        },

        // ✅ UPDATED - Don't auto-start module tours if main tour never started
        startModuleTourIfEligible: (moduleKey, steps, opts) => {
          if (moduleKey === "group" || !steps?.length) return
          
          // Don't start module tours if main tour has never been started
          if (!hasTourEverStarted()) {
            console.log(`🚫 Cannot start ${moduleKey} tour - main tour has never been started`)
            return
          }
          
          const groupStatus = getStatus("group")
          const moduleStatus = getStatus(moduleKey)

          // Don't start if module already completed
          if (moduleStatus === "done") {
            console.log(`⏭️ Module ${moduleKey} already completed, skipping tour`)
            return
          }

          // Check if user can start tours (either completed group tour or skipped something)
          const canShowTour = groupStatus !== "new" || hasAnySkip()
          if (!canShowTour) {
            console.log(`🚫 Cannot start ${moduleKey} tour - group tour not completed yet`)
            return
          }

          const showWelcome = opts?.showWelcome ?? false
          setStatus(moduleKey, "seen")

          console.log(`🎯 Starting module tour: ${moduleKey}`)
          set({
            steps,
            activeFlow: "module",
            activeModuleKey: moduleKey,
            welcomeOpen: showWelcome,
            started: !showWelcome,
            dismissed: false,
            currentIndex: 0,
          })

          if (!showWelcome) {
            goToRouteIfNeeded(steps[0])
          }
        },

        // ✅ UPDATED - Don't auto-show welcome for module visits
        openOnFirstVisit: (key, cfg) => {
          const k = key as ModuleKey
          let steps: TourStep[] | undefined
          let wantWelcome = true
          
          if (Array.isArray(cfg)) {
            steps = cfg
          } else if (cfg) {
            steps = cfg.steps
            if (typeof cfg.showWelcome === "boolean") wantWelcome = cfg.showWelcome
          }

          // ✅ Use getModuleSteps if no steps provided
          if (!steps?.length) {
            steps = getModuleSteps(k)
          }
          
          if (!steps?.length) {
            console.warn(`⚠️ No steps found for module: ${k}`)
            return
          }

          // ✅ Don't auto-show welcome for module visits unless tour has been started before
          if (k !== "group") {
            if (!hasTourEverStarted()) {
              console.log(`🚫 Cannot start ${k} tour - main tour has never been started`)
              return
            }
            
            const groupStatus = getStatus("group")
            const canStart = groupStatus !== "new" || hasAnySkip()
            if (!canStart) {
              console.log(`🚫 Cannot start ${k} tour - group tour must be completed first`)
              return
            }
          }

          const canWelcome = wantWelcome && !localStorage.getItem(WELCOME_KEY)
          if (canWelcome) localStorage.setItem(WELCOME_KEY, "1")

          console.log(`🎯 Opening tour for: ${k}`)
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
        },

        resetFor: (moduleKey) => {
          console.log(`🔄 Resetting tour for: ${moduleKey}`)
          localStorage.removeItem(statusKeyFor(moduleKey))
          
          // ✅ If resetting current active tour, also reset state
          const s = get()
          if (s.activeModuleKey === moduleKey) {
            set({ 
              started: false, 
              dismissed: false, 
              currentIndex: 0,
              activeFlow: undefined,
              activeModuleKey: null 
            })
          }
        },
      }
    },
    { 
      name: "onboarding_checklist_store", 
      partialize: (s) => ({ checklist: s.checklist }) 
    }
  )
)

/* -------------------- Helper Functions -------------------- */

// ✅ Get all checklist items that should be auto-checked for a completed module
export const getModuleChecklistItems = (moduleKey: ModuleKey): string[] => {
  const moduleCompletionMap: Record<ModuleKey, string[]> = {
    "group": [
      "resume-manager-upload", "auto-apply-link", "ai-tailored-upload", "ai-resume-create"
    ],
    "resume-manager": ["resume-manager-upload", "resume-manager-save"],
    "auto-apply": ["auto-apply-link", "auto-apply-20"],
    "initialize-resume-generation": ["ai-tailored-upload", "ai-tailored-run"],
    "ai-single-resume-generator": ["ai-tailored-upload", "ai-tailored-run"],
    "ai-bulk-resume-generator": ["ai-tailored-upload", "ai-tailored-run"],
    "ai-resume-builder": ["ai-resume-history", "ai-resume-create"],
    "main-coverletter": ["ai-cover-upload", "ai-cover-generate"],
    "ai-resume-score": ["resume-score-upload", "resume-score-generate"],
    "ai-interview-guide": ["ai-guide-upload", "ai-guide-questions", "ai-guide-mock"],
    "analytics": ["analytics-session", "analytics-report"],
    "settings": ["settings-plan"],
  }

  return moduleCompletionMap[moduleKey] || []
}

// ✅ Check if a step has an associated checklist item
export const hasChecklistItem = (stepId: string): boolean => {
  return mapStepToChecklist(stepId) !== null
}

// ✅ Get progress for a specific module
export const getModuleProgress = (moduleKey: ModuleKey, checklist: Record<string, boolean>) => {
  const items = getModuleChecklistItems(moduleKey)
  const completed = items.filter(id => checklist[id]).length
  return { completed, total: items.length, percentage: items.length > 0 ? (completed / items.length) * 100 : 0 }
}

// ✅ Check if module is completed based on checklist
export const isModuleCompleted = (moduleKey: ModuleKey, checklist: Record<string, boolean>): boolean => {
  const items = getModuleChecklistItems(moduleKey)
  return items.length > 0 && items.every(id => checklist[id])
}