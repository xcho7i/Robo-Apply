import { CgOrganisation } from "react-icons/cg"
import GradientButton from "@/src/components/GradientButton"
import Heading from "@/src/components/Heading"

import { useContext, useEffect, useRef, useState } from "react"
import buttonIcon from "../../../assets/dashboardIcons/startApplyingBtn.svg"
import { Button, Card, Checkbox, Flex, List } from "antd"
import { ApplyData, Job, JobHistory } from "@types"

import { activateTab, getResponseFromExtension } from "@/src/extension"
import SearchForm from "../ui/SearchForm"
import { saveJobHistory } from "@/src/api/functions"

import { User } from "@/src/api/functions/user"
import { errorToast } from "@/src/components/Toast"
import { useDashboardStore } from "@/src/stores/dashboard"
import {
  generateUUID,
  getBaseResumeText,
  getTailoredJobData,
  storeJobDetails
} from "../lib/tailored_resume"
import ResumePreview, { PreviewData } from "./ResumePreview"
import { VscLoading } from "react-icons/vsc"
import { renderAsync } from "docx-preview"
import CreditConfirmationModal from "./CreditConfirmationModal"
import { CreditValidationResult } from "../../AIBulkResumeGenerator/types"
import { AiOutlineLoading } from "react-icons/ai"
import { useSubscriptionStore } from "@/src/stores/subscription"
import { sleep } from "@/src/utils"
import clsx from "clsx"

function JobsFound() {
  let jobsFound = useDashboardStore((state) => state.jobsFound)
  let selectedResume = useDashboardStore((state) => state.selectedResume)
  let platform = useDashboardStore((state) => state.fromValues.plateform)
  let tailoredApply = useDashboardStore(
    (state) => state.fromValues.tailoredApply
  )

  let dailyLimit = useSubscriptionStore((state) => state.dailyLimit)
  let credits = useSubscriptionStore((state) => state.remainingCredits)

  const [baseResumeData, setBaseResumeData] = useState({ text: "", size: 0 })

  const setShowComponent = useDashboardStore((state) => state.setShowComponent)
  const startNewSearch = useDashboardStore((state) => state.startNewSearch)
  const setApplyResults = useDashboardStore((state) => state.setApplyResults)
  const setJobsFound = useDashboardStore((state) => state.setJobsFound)
  const sessionId = useRef(generateUUID()).current

  const [loading, setLoading] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const [showResumePreview, setShowResumePreview] = useState(false)

  const [tailoredData, setTailoredData] = useState<PreviewData[]>([])

  const [generating, setGenerating] = useState(false)
  const [totalGenerating, setTotalGenerating] = useState(0)

  // Credit confirmation modal state
  const [creditModal, setCreditModal] = useState<{
    isOpen: boolean
    creditValidation: CreditValidationResult | null
    pendingAction: (() => Promise<void>) | null
    isLoading: boolean
  }>({
    isOpen: false,
    creditValidation: null,
    pendingAction: null,
    isLoading: false
  })

  const closeCreditModal = () => {
    setCreditModal({
      isOpen: false,
      creditValidation: null,
      pendingAction: null,
      isLoading: false
    })
  }

  // Credit validation helper functions
  const handleCreditConfirmation = async () => {
    if (creditModal.pendingAction) {
      creditModal.pendingAction()
      try {
        setCreditModal({
          isOpen: false,
          creditValidation: null,
          pendingAction: null,
          isLoading: false
        })
      } catch (error) {
        console.error("🎯 Error executing confirmed action:", error)
        setCreditModal((prev) => ({ ...prev, isLoading: false }))
      }
    } else {
      console.warn("🎯 No pending action found")
    }
  }

  const applyResults = useRef<JobHistory[]>([])

  async function continueApplying() {
    applyResults.current = []
    const jobsToApply = jobsFound.filter((job) => job.selected)
    if (jobsToApply.length === 0) {
      return errorToast("Please select at least one job to apply.")
    }
    if (!credits) {
      return errorToast("You have no credits to apply")
    }

    if (jobsToApply.length > credits / 6) {
      return errorToast(
        "You have " +
          credits +
          " credits left. Please select less jobs to apply."
      )
    }

    if (jobsToApply.length > dailyLimit) {
      return errorToast(
        "You're remaining AutoApply limit is " +
          dailyLimit +
          ". Please select less jobs to apply."
      )
    }

    if (!selectedResume?._id) {
      return errorToast("Please select a resume to apply.")
    }

    // EXISTING CODE: Rest of the function remains exactly the same
    let error = false

    try {
      setLoading(true)

      let applyData: ApplyData = jobsToApply.map((job, jobIndex) => ({
        job: job,

        tailoredResume: tailoredData.find((d) => d.jobId == job.id)?.base64
      }))

      const responses = await getResponseFromExtension({
        type: "applyJobs",
        platform: platform,
        resume: selectedResume,
        data: applyData
      })

      let error =
        responses.find((r) => r.message == "error" && r.error)?.error || ""
      if (error) {
        alert("Error Applying Jobs: " + error)
      }

      responses.forEach((r, i) => {
        if (r.message == "stop") return

        const result: JobHistory = {
          jobTitle: applyData[i].job.title,
          jobUrl: applyData[i].job.url,
          companyName: applyData[i].job.company,
          resumeId: selectedResume._id as string,
          platform: platform,
          deleted: false,
          status: r.message as any
        }

        applyResults.current.push(result)
        if (r.message == "applied") {
          saveJobHistory(result).catch((e) => console.error(e))
          User.deductCredits("AutoApply").catch((e) => console.error(e))
        }
      })

      // console.log({ responses })

      // for await (const job of jobsToApply) {
      //   const jobIndex = jobsToApply.findIndex(
      //     (j) => j.id == job.id && j.company == job.company
      //   )

      //   const response = await getResponseFromExtension({
      //     type: "ApplyJobs",
      //     platform: platform,
      //     resume: selectedResume,
      //     data: applyData,
      //   })

      //   if (response?.error && response.message == "error") {
      //     console.error("Error Applying Jobs:", response.error)
      //     alert("Error Applying Jobs: " + response.error)
      //     error = true
      //     break
      //   }

      //   if (response.message == "stop") {
      //     break
      //   }

      //   const result: JobHistory = {
      //     jobTitle: job.title,
      //     jobUrl: job.url,
      //     companyName: job.company,
      //     resumeId: selectedResume._id,
      //     platform: platform,
      //     deleted: false,
      //     status: response.message as any
      //   }

      //   applyResults.current.push(result)
      //   if (response.message == "applied") {
      //     await saveJobHistory(result).catch((e) => console.error(e))
      //     await User.deductCredits("AutoApply").catch((e) => console.error(e))
      //   }

      //   if (response?.message === "skipped") {
      //     continue
      //   }

      //   const isLast = jobsToApply[jobsToApply.length - 1].id == job.id

      //   if (isLast) break
      //   await new Promise((resolve) => setTimeout(resolve, 1500))
      //   // await activateTab()
      // }
    } catch (error) {
      console.error("Error applying jobs:", error)
      // alert("Something went wrong, while applying jobs!")
    } finally {
      await activateTab()
      setShowComponent("ResultReport")
      setApplyResults(applyResults.current)
      setLoading(false)
    }
  }

  function toggleAllJobs() {
    if (jobsFound.every((job) => job.selected)) {
      setJobsFound(
        jobsFound.map((job) => {
          return { ...job, selected: false }
        })
      )
    } else {
      setJobsFound(
        jobsFound.map((job) => {
          return { ...job, selected: true }
        })
      )
    }
  }

  async function generateTailoredResumes(confirmed = false) {
    const jobsToApply = jobsFound.filter((job) => job.selected)

    if (jobsToApply.length === 0) {
      return errorToast(
        "Please select at least one job to generate tailored resumes."
      )
    }

    let jobsToGenerate = jobsToApply.filter(
      (job) => !tailoredData.find((data) => data.jobId === job.id)
    )

    if (jobsToGenerate.length === 0) {
      return errorToast("All selected jobs already have tailored resumes!")
    }

    if (!credits) {
      return errorToast("You have no credits to generate tailored resumes!")
    }

    if (jobsToGenerate.length > credits / 15) {
      return errorToast(
        "You have " +
          credits +
          " credits left. Please select less jobs to generate tailored resumes."
      )
    }

    if (jobsToApply.length > dailyLimit) {
      return errorToast(
        "You're remaining AutoApply limit is " +
          dailyLimit +
          ". Please select less jobs to apply."
      )
    }

    if (!confirmed) {
      return setCreditModal({
        isOpen: true,
        isLoading: false,
        creditValidation: {
          action: "generateTailoredResumes",
          creditCost: jobsToGenerate.length * 15,
          canProceed: true,
          freeUsed: false,
          needsConfirmation: true,
          message: "",
          shouldShowUpgradeModal: true
        },
        pendingAction: async () => {
          generateTailoredResumes(true)
        }
      })
    }

    setGenerating(true)
    setTotalGenerating(jobsToGenerate.length + tailoredData.length)

    const saved = await storeJobDetails(
      jobsToGenerate,
      selectedResume,
      baseResumeData.text,
      baseResumeData.size,
      sessionId
    )

    if (!saved) {
      errorToast("Failed to save job session details. Please try again.")
      setGenerating(false)
      return
    }

    const results: (PreviewData | undefined)[] = []
    let jobsIterator = jobsToGenerate[Symbol.iterator]()
    let job: Job | undefined = jobsIterator.next().value

    let retrying = false

    while (true) {
      if (!job) break
      const res = await getTailoredJobData(job, baseResumeData.text, sessionId)
      // console.log("Whileloop", res)
      if (res) {
        retrying = false
        results.push(res)
        job = jobsIterator.next().value

        if (res.arrayBuffer && res.base64) {
          setTailoredData((prev) => [...prev, res])
        }
      } else if (!retrying) {
        console.log("Retrying...")
        retrying = true
        await sleep(2000)
      } else {
        console.log("Retry failed, skipping...")
        errorToast(
          "Failed to generate a tailored resume. Please try again after process completed."
        )
        retrying = false
        job = jobsIterator.next().value
      }
    }

    setGenerating(false)
  }

  async function handlePreview(job: Job) {
    let generated = tailoredData.find((d) => d.jobId == job.id)

    if (!generated) return errorToast("No generated resume found!")

    setShowResumePreview(true)

    // Render the new tailored resume
    const newResumeContainer = document.getElementById("new-resume-preview")

    if (newResumeContainer && generated) {
      newResumeContainer.innerHTML =
        '<div class="flex items-center justify-center h-full min-h-[200px]"><div class="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent rounded-full text-purple-600" role="status"><span class="sr-only">Loading...</span></div><p class="ml-3 text-sm text-gray-600">Rendering tailored resume...</p></div>'

      try {
        // Clear the loading state and prepare container
        newResumeContainer.innerHTML = ""
        newResumeContainer.className =
          "docx-wrapper w-full h-full overflow-auto bg-white p-4"

        await renderAsync(
          generated?.arrayBuffer,
          newResumeContainer,
          undefined,
          {
            className: "docx-content",
            inWrapper: false,
            ignoreWidth: false,
            ignoreHeight: false,
            ignoreFonts: false,
            breakPages: false,
            ignoreLastRenderedPageBreak: true,
            experimental: false,
            trimXmlDeclaration: true
          }
        )
      } catch (renderError) {
        console.error("Error rendering new resume:", renderError)
        newResumeContainer.innerHTML =
          '<div class="flex items-center justify-center h-full min-h-[200px] text-red-600"><div class="text-center"><p class="font-medium">Failed to render tailored resume</p><p class="text-sm text-gray-500 mt-1">Please try again or download the file</p></div></div>'
      }
    }
  }

  function isResumeGenerated(jobId: string) {
    return !!tailoredData.find((d) => d.jobId == jobId)
  }

  useEffect(() => {
    if (selectedResume && tailoredApply) {
      getBaseResumeText(selectedResume.resumeUrl).then((res) => {
        if (res.content) {
          setBaseResumeData({ text: res.content, size: res.fileSize })
        } else {
          errorToast(res.error)
        }
      })
    }
  }, [selectedResume, tailoredApply])

  return (
    <>
      <SearchForm
        showFull={false}
        onFinish={startNewSearch}
        loading={loading}
      />

      {(!jobsFound || jobsFound.length === 0) && (
        <div className="flex items-center justify-center h-1/2">
          <Heading type="h2">No Jobs Found</Heading>
        </div>
      )}

      {jobsFound.length > 0 && (
        <List
          dataSource={jobsFound}
          bordered
          header={
            <Flex className="items-center justify-between">
              <div className="flex items-center gap-4 text-base">
                <Checkbox
                  onChange={toggleAllJobs}
                  checked={jobsFound.every((job) => job.selected)}
                />
                <span
                  className="cursor-pointer text-lg font-semibold"
                  id="select-all"
                  onClick={toggleAllJobs}>
                  {jobsFound.every((job) => job.selected)
                    ? "Deselect All"
                    : "Select All"}{" "}
                  ({jobsFound.length})
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-base lg:text-lg font-semibold">
                  Selected: {jobsFound.filter((job) => job.selected).length}
                </span>
                {tailoredApply == "yes" && (
                  <>
                    <div className="flex flex-col">
                      <span
                        className={clsx(
                          generating
                            ? "text-sm"
                            : "text-base lg:text-lg font-semibold"
                        )}>
                        Generated: {tailoredData.length}
                      </span>
                      {generating && (
                        <span className="text-sm  ">
                          Remaining: {totalGenerating - tailoredData.length}
                        </span>
                      )}
                    </div>
                    <GradientButton
                      disabled={jobsFound?.length === 0 || generating}
                      className="flex items-center gap-2 disabled:cursor-not-allowed"
                      icon={
                        generating ? (
                          <AiOutlineLoading
                            className="animate-spin"
                            size={20}
                          />
                        ) : null
                      }
                      onClick={() => generateTailoredResumes()}>
                      Generate Resume
                    </GradientButton>
                  </>
                )}
                <GradientButton
                  disabled={jobsFound?.length === 0}
                  className="flex items-center gap-2 disabled:cursor-not-allowed"
                  onClick={continueApplying}>
                  <img
                    src={buttonIcon}
                    alt="Start Applying Icon"
                    loading="lazy"
                  />
                  Continue Applying
                </GradientButton>
              </div>
            </Flex>
          }
          className="w-full">
          <List.Item className="flex w-full flex-wrap !justify-start  gap-">
            {jobsFound?.map((job) => (
              <div
                key={job.id}
                className="w-full sm:w-1/2 md:w-1/2  lg:w-1/3   p-3 ">
                <Card className="  relative    bg-inputBackGround">
                  <Checkbox
                    onChange={() => {
                      setJobsFound(
                        jobsFound.map((j) => {
                          if (j.id === job.id) {
                            return { ...j, selected: !j.selected }
                          }
                          return j
                        })
                      )
                    }}
                    checked={job.selected}
                    className="absolute right-4 top-2"
                  />
                  <Flex className="flex-col gap-4 w-full">
                    <Heading
                      type="h2"
                      className="flex items-center gap-1.5 w-full text-ellipsis  whitespace-nowrap overflow-hidden">
                      {job.logo ? (
                        <img
                          src={job.logo}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <CgOrganisation className="w-8 h-8" />
                      )}
                      <span
                        onClick={() => window.open(job.url, "_blank")}
                        className="cursor-pointer w-full "
                        title={job.title}>
                        {job.title}
                      </span>
                    </Heading>

                    <Heading type="h3" className="text-gray-400 flex gap-1">
                      Company:
                      <span className="text-base text-white text-ellipsis  whitespace-nowrap overflow-hidden">
                        {job.company}
                      </span>
                    </Heading>
                    <Heading
                      type="h3"
                      className="-mt-3 flex gap-1 text-gray-400  whitespace-nowrap ">
                      Job ID:{" "}
                      <span className="text-base text-white text-ellipsis whitespace-nowrap overflow-hidden">
                        {job.id}
                      </span>
                    </Heading>
                    {tailoredApply == "yes" && (
                      <Flex className="flex-col">
                        <Heading
                          type="h3"
                          className="-mt-3 flex gap-1 text-gray-400  whitespace-nowrap ">
                          Description:{" "}
                        </Heading>
                        <p className="text-sm h-20 text-white text-ellipsis  overflow-scroll">
                          {job.desc}
                        </p>
                      </Flex>
                    )}
                    <Flex className="justify-end mt-2">
                      {tailoredApply == "yes" && (
                        <GradientButton
                          icon={
                            job.selected &&
                            generating &&
                            !isResumeGenerated(job.id) ? (
                              <AiOutlineLoading className="animate-spin" />
                            ) : null
                          }
                          className=" !px-2 !py-1    disabled:cursor-not-allowed"
                          onClick={() => handlePreview(job)}
                          disabled={!isResumeGenerated(job.id)}>
                          Preview Resume
                        </GradientButton>
                      )}
                    </Flex>
                  </Flex>
                </Card>
              </div>
            ))}
          </List.Item>
        </List>
      )}

      <ResumePreview
        isOpen={showResumePreview}
        setIsOpen={setShowResumePreview}
      />

      {/* Credit Confirmation Modal */}
      <CreditConfirmationModal
        isOpen={creditModal.isOpen}
        onClose={closeCreditModal}
        onConfirm={handleCreditConfirmation}
        creditValidation={creditModal.creditValidation!}
        isLoading={creditModal.isLoading}
      />
    </>
  )
}
export default JobsFound
