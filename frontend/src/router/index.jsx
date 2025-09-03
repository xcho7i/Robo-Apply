import React from "react"
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"

import HomePage from "../pages/home"
import SIgnIn from "../pages/auth/signIn"
import SignUp from "../pages/auth/signUp"
import DashboardHome from "../pages/dashboard"
import ForgetPassword from "../pages/auth/forgetPassword"
import VerifyOtp from "../pages/auth/verifyOtp"
import ResetPassword from "../pages/auth/resetPassword"
import AiCoverLetterGenerator from "../pages/aiCoverLetter"
import GenerateCoverLetter from "../pages/aiCoverLetter/generateCoverLetter"
import ScanResume from "../pages/resumeScore/resumeScan"
import ApplicationUpdate from "../pages/resumeScore/applicationUpdate"
import UploadAndShowResume from "../pages/resumeManager"
import JobApply from "../pages/dashboard/jobApply"
import GetFeedback from "../pages/dashboard/getFeedBack"
import EditResumeManager from "../pages/resumeManager/editResumeManager"
import PersonalProfile from "../pages/PersonalProfile"
import Analytics from "../pages/Analytics"
import InterviewGuide from "../pages/InterviewGuide"
import LiveInterview from "../pages/InterviewCopilot/LiveInterview"
import AddYourResume from "../pages/InterviewCopilot/AddYourResume"
import AddYourPosition from "../pages/InterviewCopilot/AddYourPosition"
import ChosseResumeMake from "../pages/resumeBuilder/ChoseResumeMake"
import CreateResumeBuilder from "../pages/resumeBuilder/CreateResumeBuilder"
import ChooseTemplateCreateResume from "../pages/resumeBuilder/chooseTemplateCreateResume"
import CreateResumeProfile from "../pages/resumeBuilder/createResumeProfile"
import CreateResumeExperience from "../pages/resumeBuilder/CreateResumeExperience"
import CreateResumeEducation from "../pages/resumeBuilder/createResumeEducation"
import CreateResumeAdditional from "../pages/resumeBuilder/CreateResumeAdditional"
import FeaturesPage from "../pages/features"
import FaqBlogPage from "../pages/faq"
import HowTousePage from "../pages/how-to-use"
import ScanPage from "../pages/scan"
import PricingPage from "../pages/pricing"
import ShowResume from "../pages/resumeBuilder/ShowResume"
import ResumeComplete from "../pages/resumeBuilder/ResumeComplete"
import PricingPlan from "../pages/pricing/pricingPlan"
import PrivateRoute from "./PrivateRoute"
import Billing from "../pages/Billing/Index"
import CancelAccount from "../pages/CancelAccount/index"
import CreateCoverLetter from "../pages/coverLetterNew/createCoverLetter"
import ASKSpecificJob from "../pages/coverLetterNew/askSpecificJob"
import DesiredJobYes from "../pages/coverLetterNew/desiredJob/deiredJobYes"
import ProfessionalSkills from "../pages/coverLetterNew/professionalSkills"
import CoverLetterExperience from "../pages/coverLetterNew/coverLetterExperience"
import DesiredJobNo from "../pages/coverLetterNew/desiredJob/desiredJobNo"
import MainCoverLetter from "../pages/coverLetterNew"
import ShowCoverLetter from "../pages/coverLetterNew/showCoverLetter"
import ShowCvData from "../pages/coverLetterNew/showCvData"
import SuccessPage from "../pages/pricing/successPage"
import FailurePage from "../pages/pricing/failurePage"
import MainResumeBuilder from "../pages/resumeBuilder"
import BuyCredits from "../pages/pricing/ui/BuyCredits"
import AIBulkResumeGenerator from "../pages/AIBulkResumeGenerator/BulkJobGenerator"
import InitializeResumeGeneration from "../pages/AIBulkResumeGenerator/InitializeResumeGeneration"
import MainInterviewGuide from "../pages/InterviewGuide/MainInterviewGuide"
import ShowInterviewGuide from "../pages/InterviewGuide/ShowInterviewGuide"

import AISingleResumeGenerator from "../pages/AIBulkResumeGenerator/SingleJobGenerator"
import FreeTrialPackage from "../pages/pricing/FreeTrialPackage"
import Onboarding from "../pages/onboarding"
import TawkScript from "../components/TawkScript"
import MainAIResumeScore from "../pages/scan/MainAIResumeScore"
import AIInterviewCopilot from "../pages/InterviewCopilot/LiveInterview/AIInterviewCopilot/App"

const AppRouter = () => {
  return (
      <BrowserRouter>
        <TawkScript />
        <Routes>
          <Route path="/" element={<Navigate to="/signIn" replace />} />

          <Route path="/home" element={<HomePage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/scan-Main" element={<MainAIResumeScore />} />

          <Route path="/faq" element={<FaqBlogPage />} />
          <Route path="/how-to-use" element={<HowTousePage />} />

          <Route path="/features" element={<FeaturesPage />}></Route>
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/package" element={<FreeTrialPackage />} />

          <Route path="/pricingPlan" element={<PricingPlan />} />
          <Route path="/buyCredits" element={<BuyCredits />} />

          <Route path="/signIn" element={<SIgnIn />} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/forgetPassword" element={<ForgetPassword />} />
          <Route path="/resetPassword" element={<ResetPassword />} />
          <Route path="/verifyOtp" element={<VerifyOtp />} />
          <Route path="/onboarding" element={<Onboarding />} />

          <Route path="/features" element={<FeaturesPage />}></Route>
          {/* Protected Routes */}

          <Route
            path="/auto-apply"
            element={<PrivateRoute element={<DashboardHome />} />}
          />

          {/* <Route
          path="/dashboard/job-apply"
          element={<PrivateRoute element={<JobApply />} />}
        />
        <Route
          path="/dashboard/job-apply/get-feedback"
          element={<PrivateRoute element={<GetFeedback />} />}
        /> */}

          <Route
            path="/dashboard-cover"
            element={<PrivateRoute element={<AiCoverLetterGenerator />} />}
          />
          <Route
            path="/dashboard-cover/generate-cover"
            element={<PrivateRoute element={<GenerateCoverLetter />} />}
          />

          <Route
            path="/main-coverletter"
            element={<PrivateRoute element={<MainCoverLetter />} />}
          />

          <Route
            path="/coverletter"
            element={<PrivateRoute element={<CreateCoverLetter />} />}
          />

          <Route
            path="/coverletter/askSpecificJob"
            element={<PrivateRoute element={<ASKSpecificJob />} />}
          />

          <Route
            path="/coverletter/desiredJobYes"
            element={<PrivateRoute element={<DesiredJobYes />} />}
          />

          <Route
            path="/coverletter/show-cv-data"
            element={<PrivateRoute element={<ShowCvData />} />}
          />

          <Route
            path="/coverletter/desiredJobNo"
            element={<PrivateRoute element={<DesiredJobNo />} />}
          />

          <Route
            path="/coverletter/professionalSkills"
            element={<PrivateRoute element={<ProfessionalSkills />} />}
          />

          <Route
            path="/coverletter/experience"
            element={<PrivateRoute element={<CoverLetterExperience />} />}
          />

          <Route
            path="/show-cover-letter"
            element={<PrivateRoute element={<ShowCoverLetter />} />}
          />

          <Route
            path="/plan-purchase-success"
            element={<PrivateRoute element={<SuccessPage />} />}
          />

          <Route
            path="/plan-purchase-failure"
            element={<PrivateRoute element={<FailurePage />} />}
          />

          <Route
            path="/scan-resume"
            element={<PrivateRoute element={<ChosseResumeMake />} />}
          />

          <Route
            path="/scan-resume/create"
            element={<PrivateRoute element={<CreateResumeBuilder />} />}
          />

          <Route
            path="/scan-resume/main-ResumeBuilder"
            element={<PrivateRoute element={<MainResumeBuilder />} />}
          />

          <Route
            path="/scan-resume/makeProfile"
            element={<PrivateRoute element={<CreateResumeProfile />} />}
          />
          <Route
            path="/scan-resume/addExperience"
            element={<PrivateRoute element={<CreateResumeExperience />} />}
          />
          <Route
            path="/scan-resume/addEducation"
            element={<PrivateRoute element={<CreateResumeEducation />} />}
          />
          <Route
            path="/scan-resume/addAdditional"
            element={<PrivateRoute element={<CreateResumeAdditional />} />}
          />
          <Route
            path="/scan-resume/chooseTemplateCreateResume"
            element={<PrivateRoute element={<ChooseTemplateCreateResume />} />}
          />

          <Route
            path="/scan-resume/showResume"
            element={<PrivateRoute element={<ShowResume />} />}
          />
          <Route
            path="/scan-resume/complete"
            element={<PrivateRoute element={<ResumeComplete />} />}
          />

          <Route
            path="/scan-resume/application-update"
            element={<PrivateRoute element={<ApplicationUpdate />} />}
          />
          <Route
            path="/resume-manager"
            element={<PrivateRoute element={<UploadAndShowResume />} />}
          />
          <Route
            path="/ai-bulk-resume-generator"
            element={<PrivateRoute element={<AIBulkResumeGenerator />} />}
          />
          <Route
            path="/ai-single-resume-generator"
            element={
              <PrivateRoute
                element={
                  <AIBulkResumeGenerator isSingleGenerationPage={true} />
                }
              />
            }
          />
          <Route
            path="/initialize-resume-generation/:sessionId?"
            element={<PrivateRoute element={<InitializeResumeGeneration />} />}
          />
          <Route
            path="/edit-profile"
            element={<PrivateRoute element={<PersonalProfile />} />}
          />
          <Route
            path="/analytics"
            element={<PrivateRoute element={<Analytics />} />}
          />
          <Route
            path="/main-interview-Guide"
            element={<PrivateRoute element={<MainInterviewGuide />} />}
          />
          <Route
            path="/interview-Guide"
            element={<PrivateRoute element={<InterviewGuide />} />}
          />

          <Route
            path="/show-interview-guide"
            element={<PrivateRoute element={<ShowInterviewGuide />} />}
          />
          <Route
            path="/live-interview"
            element={<PrivateRoute element={<LiveInterview />} />}
          />
          <Route
            path="/live-interview/:sessionId?"
            element={<PrivateRoute element={<AIInterviewCopilot />} />}
          />
          <Route
            path="/add-your-resume"
            element={<PrivateRoute element={<AddYourResume />} />}
          />
          <Route
            path="/add-your-position"
            element={<PrivateRoute element={<AddYourPosition />} />}
          />
          <Route
            path="/resume-manager/editResume"
            element={<PrivateRoute element={<EditResumeManager />} />}
          />
          <Route
            path="/billing"
            element={<PrivateRoute element={<Billing />} />}
          />
          <Route
            path="/accountcancelation"
            element={<PrivateRoute element={<CancelAccount />} />}
          />
        </Routes>
      </BrowserRouter>
  )
}

export default AppRouter
