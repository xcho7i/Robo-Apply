const API_ENDPOINTS = {
  LOGIN: "/api/user/login",
  SignUP: "/api/user/user-signup",
  GOOGLE_SIGN_IN: "/api/user/google-callback",
  ForgetPassword: "/api/user/forgot-password",
  VerifyOTP: "/api/user/verify-reset-otp",
  ResetNewPassword: "/api/user/reset-password",
  AiCoverLetterGenerate: "/ai/generate-cover-letter",
  AiCoverLetterGenerate2: "/ai/generate-cover-letter_v2",
  RegenerateCoverLetter: "/ai/regenerate_cover_letter",
  FileUpload: "/api/user/upload-file",
  UpdateProfile: "/api/user/update-user",
  ResumeManager: "/ai/resume-manager",
  GetAllResumes: "/api/resume/view-resumes",
  ViewSpecificResume: (id: string) => `/api/resume/view-resume/${id}`,
  DeleteResume: "/api/resume/delete-resume",
  UpdateResume: (id: string) => `/api/resume/update-resume/${id}`,
  DownloadFile: (url: string) =>
    `/api/user/download-file?url=${encodeURIComponent(url)}`,
  AddResume: "/api/resume/add-resume",
  FileuploadResumeBuilder: "/ai/resume-builder",
  GenerateInterviewGuide: "/ai/interview-guide",
  InterviewGuideQuestions: "/ai/interview-guide-reverse_questioning",
  SaveAdvancedSearch: "/api/searchHistory/add-search-history",
  GetAllAdvancedSeardch: "/api/searchHistory/view-search-history",
  GetAdvancedSeardchSpecific: "/api/searchHistory/view-search-history",

  SaveJobHistory: "/api/jobs-activity/add-job-activity",
  JobActivityCount: "/api/jobs-activity/job-activity-count",
  ViewJobHistory: "/api/jobs-activity/view-job-activities",

  GetAnalyticsBySession: "/api/user/getSavedJobsByDate",
  GetAllAnalyticsForTable: "/api/user/getSavedJobsByFilters",
  GetAnalyticsByPlatform: "/api/user/savedJobsByPlatform",
  GenerateSkillsCoverLetter: "/ai/generate-skills",
  GenerateJobDescription: "/ai/generate-jed",
  ImproveJobDescriptionWithAI: "/ai/improve-descriptions",
  GenerateAchivementDescription: "/ai/generate-ctd",
  CreateResumeBuilder: "/api/resumeBuilder/add-resume",
  UpdateResumeBuilder: "/api/resumeBuilder/update-resume",
  DeleteResumeBuilder: "/api/resumeBuilder/delete-resume",
  GetAllResumeBuilder: "/api/resumeBuilder/view-resumes",
  GetResumeBuilderById: "/api/resumeBuilder/view-resume",
  ResumeScore: "/ai/generate-rms",
  GenerateSummary: "/ai/generate-suggested-summary",
  FetchCVDataForCoverLetter: "/ai/generate-cover-letter_v2",
  AddCoverLetter: "/api/coverLetter",
  GetCoverLetter: "/api/coverLetter",
  GetSimpleCoverLetter: "/ai/generate-cover-letter_v4",
  Subscription: "/api/subscription/create-subscription",
  SubscriptionData: "/api/user/subscription",

  BuyCredits: "/api/user/buyCredits",
  GenerateSkills: "/ai/generate-skills",
  GenerateAIJobDescription: "/ai/generate-jd",
  GetBillingData: "/api/user/accountBilling",
  DeductCredits: "/api/user/updateUserCredits",
  PostInterviewGuide: "/api/jobPrep/create-job-prep",
  GetInterviewGuideFile: "/api/jobPrep/view-job-preps",
  GetSingleInterviewData: "/api/jobPrep/view-job-prep",
  DeleteInterviewGuideData: "/api/jobPrep/delete-job-prep",
  SendSubscriptionTeam: "/api/subscription/reason",
  DiscountSubscription: "/api/subscription/discount",
  CancelSubscribtion: "/api/subscription/cancel",
  RevertSubscription: "/api/subscription/revertUnsub",
  UpdateSubscription: "/api/subscription/upgrade",

  GenerateSingleAIJobTitle: "/api/ai-resume-tailor/generate-job-title",
  GenerateSingleAIJobDescriptionV2:
    "/api/ai-resume-tailor/generate-job-description",
  GenerateSingleAISkill: "/api/ai-resume-tailor/generate-job-skills",
  GenerateAIResume: "/api/ai-resume-tailor/get-tailored-data-for-resume",
  GenerateAIResumeAutoApply:
    "/api/ai-resume-tailor/get-tailored-data-for-resume-auto-apply",
  AIResumeTailorCreditStatus: "/api/ai-resume-tailor/credit-status",
  SaveJobsToSession: "/api/ai-resume-tailor/store-job-details",
  GetSessionData: "/api/ai-resume-tailor/get-session-data",
  UploadBaseResume: "/api/ai-resume-tailor/upload-base-resume",
  AnalyzeResumeScore: "/api/ai-resume-tailor/analyze-resume-job-match",
  DeleteGeneration: "/api/ai-resume-tailor/delete-generation",

  // New onboarding endpoints for the four required functions
  CompleteOnboarding: "/api/onboarding/complete",
  GetOnboardingData: "/api/onboarding",
  UpdateOnboardingData: "/api/onboarding",
  SkipOnboarding: "/api/onboarding/skip",
  CreateOnboardingData: "/api/onboarding",

  //on Boarding datta
  OnBoardingData: "/api/onboarding/submit",

  //change password
  ChangePassword: "/api/user/setPassword",

  //Resume Score
  GetResumeScore: "/api/resScore/get-resume-scores",
  DeleteResumeScore: "/api/resScore/delete-resume-score",
  PostResumeScore: "/api/resScore/add-resume-score",
  //feedback
  AddFeedback: "/api/feedback/add-feedback",

  //AI Interview Copilot Contexts
  AddInterviewContexts:
    "/api/aiInterviewCopilot/live-interview/setting/additional-context/add",
  GetInterviewContexts:
    "/api/aiInterviewCopilot/live-interview/setting/additional-context/get",

  //AI Interview Resume Contexts
  UploadNewResume: "/api/aiInterviewCopilot/add-your-resume/add",
  GetResumes: "/api/aiInterviewCopilot/add-your-resume/get",
  RemoveResume: "/api/aiInterviewCopilot/add-your-resume/remove",

  //AI interview copilot interview add your position
  AddPosition: "/api/aiInterviewCopilot/add-your-position/add",
  GetPositions: "/api/aiInterviewCopilot/add-your-position/get",
  RemovePosition: "/api/aiInterviewCopilot/add-your-position/remove",

  // AI Copilot Interview Sessions
  AddInterviewSession: "/api/aiInterviewCopilot/interview-session/addSession",
  DeleteInterviewSession:
    "/api/aiInterviewCopilot/interview-session/deleteSession",
  GetInterviewSessions: "/api/aiInterviewCopilot/interview-session/getSessions",
  GetAllInterviewSessions:
    "/api/aiInterviewCopilot/interview-session/getAllSessions",
  UpdateInterviewSession:
    "/api/aiInterviewCopilot/interview-session/updateSession"
}

export default API_ENDPOINTS
