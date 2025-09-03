import { BiCurrentLocation } from "react-icons/bi"
import { AiOutlineLoading, AiOutlineOrderedList } from "react-icons/ai"
import { AiOutlineSearch } from "react-icons/ai"
import { useForm } from "antd/es/form/Form"
import { SearchProps } from "../../../../../@types"
import { Flex, Form, Input, Select } from "antd"
import GradientButton from "../../../../components/GradientButton"
import buttonIcon from "../../../../assets/dashboardIcons/startApplyingBtn.svg"
import { useEffect, useState } from "react"
import { countries, getEmojiFlag } from "@/src/utils"
import UpgradePlanModal from "../../../../components/Modals/UpgradePlanModal"

import { useSubscriptionStore } from "@/src/stores/subscription"
import { useDashboardStore } from "@/src/stores/dashboard"
import Tooltip from "../Tooltip"

interface Props {
  onFinish: (values: SearchProps) => void
  loading: boolean
  showFull: boolean
}

export default function SearchForm({
  onFinish,
  loading,
  showFull = true
}: Props) {
  const fromValues = useDashboardStore((state) => state.fromValues)
  const resumes = useDashboardStore((state) => state.resumeList)
  const loadingMain = useDashboardStore((state) => state.loading)
  const subscription = useSubscriptionStore((state) => state.subscription)

  const [form] = useForm<SearchProps>()

  // Add state for upgrade modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    form.setFieldsValue(fromValues)
  }, [])

  // New function to handle form submission with credits check
  const handleFormSubmit = async () => {
    try {
      // Validate form first
      const values = await form.validateFields()
      if (!showFull) {
        return onFinish(values)
      }

      const monthlyCredits =
        subscription?.subscription.remaining?.monthlyCredits ?? 0

      // Get target jobs count from form
      const targetJobs = parseInt(values.target || "20")

      if (monthlyCredits < targetJobs) {
        return setShowUpgradeModal(true)
      }

      // If credits are sufficient, proceed with original onFinish
      onFinish(values)
    } catch (error) {
      console.error("Form validation error:", error)
    }
  }

  return (
    <>
      <div
        id="start-applying-section"
        data-tour="start-applying-section"
        className="w-full flex flex-col gap-2 sm:gap-4">
        <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row items-center justify-between">
          {showFull ? (
            <div className="flex  gap-3">
              <p className="text-primary text-2xl font-semibold">
                Start Applying Jobs
              </p>
              <Tooltip message="Resume Manager profile required" />
            </div>
          ) : (
            <p className="text-primary text-2xl font-semibold">
              Select Jobs To Apply
            </p>
          )}

          <GradientButton
            className="hidden sm:flex  py-3"
            style={{ borderRadius: "60px" }}
            disabled={loading || loadingMain}
            onClick={handleFormSubmit}
            icon={
              loadingMain ? (
                <AiOutlineLoading className="animate-spin" size={20} />
              ) : (
                <img
                  src={buttonIcon}
                  alt="Start Applying Icon"
                  loading="lazy"
                />
              )
            }>
            {showFull ? "Start Applying" : "Start a New Search"}
          </GradientButton>
        </div>

        <Form
          onFinish={onFinish}
          form={form}
          className={`flex w-full flex-col sm:gap-2  rounded-lg bg-black/30  p-4 pt-6`}>
          <Flex className="w-full flex-col sm:flex-row items-center justify-center   sm:gap-4 rounded-lg  ">
            <Form.Item
              initialValue={""}
              rules={[{ required: true, message: "Please enter search query" }]}
              className="flex-1 w-full sm:max-w-80 "
              name={"q"}>
              <Input
                readOnly={!showFull}
                prefix={<AiOutlineSearch className="text-2xl" />}
                size="large"
                className="flex-1  "
                placeholder="Search For Software Developer, Analyst etc."
              />
            </Form.Item>
            <Form.Item
              className="flex-1 w-full sm:max-w-72"
              initialValue={null}
              name={"location"}>
              <Select
                // readOnly={!showFull}
                prefix={<BiCurrentLocation className="text-2xl" />}
                size="large"
                showSearch
                placeholder="Location"
                notFoundContent={"No Location Found"}
                allowClear
                options={[
                  {
                    label: <span>Top Locations</span>,
                    title: "Top Locations",
                    options: [
                      {
                        label: getEmojiFlag("US") + " " + "United States",
                        value: "United States__USA,US-t"
                      },
                      {
                        label: getEmojiFlag("CA") + " " + "Canada",
                        value: "Canada__CAN,CA-t"
                      }
                    ]
                  },
                  {
                    label: <span>All Locations</span>,
                    title: "All Locations",
                    options: countries.map((country) => ({
                      label: getEmojiFlag(country.iso2) + " " + country.name,
                      value: `${country.name}__${country.iso3},${country.iso2}`
                    }))
                  }
                ]}
                //   options={countries.map((country) => ({
                //     label: getEmojiFlag(country.iso2) + " " + country.name,
                //     value: `${country.name}__${country.iso3},${country.iso2}`
                //   }))
                // }
              />
            </Form.Item>

            <Form.Item
              initialValue={"20"}
              className=" w-full sm:w-52"
              name={"target"}>
              <Select
                prefix={<AiOutlineOrderedList className="text-2xl" />}
                size="large"
                className="w-48   "
                placeholder="Target Jobs"
                options={[
                  { label: "Target 20 Jobs", value: "20" },
                  { label: "Target 50 Jobs", value: "50" },
                  { label: "Target 100 Jobs", value: "100" },
                  { label: "Target 150 Jobs", value: "150" },
                  { label: "Target 200 Jobs", value: "200" },
                  { label: "Target 300 Jobs", value: "300" }
                ]}
              />
            </Form.Item>
            <Form.Item
              className="w-full sm:w-48 rounded"
              initialValue={null}
              name={"tailoredApply"}>
              <Select
                allowClear
                size="large"
                placeholder="AI Tailored Apply"
                options={[
                  {
                    label: "AI Tailored Apply",
                    value: "tailoredApply",
                    disabled: true
                  },
                  {
                    label: "Yes",
                    value: "yes"
                  },
                  {
                    label: "No",
                    value: "no"
                  }
                ]}
              />
            </Form.Item>
          </Flex>
          {showFull ? (
            <Flex className="w-full justify-center flex-wrap items-center gap-0 sm:gap-4">
              <Form.Item
                rules={[{ required: true, message: "Please select plateform" }]}
                className="w-full sm:w-48 rounded"
                initialValue={null}
                name={"plateform"}>
                <Select
                  size="large"
                  placeholder="Select Platform"
                  options={[
                    {
                      label: "Job Platform",
                      value: "plateform",
                      disabled: true
                    },
                    {
                      label: "LinkedIn",
                      value: "linkedin"
                    },
                    {
                      label: "Dice",
                      value: "dice"
                    }
                  ]}
                />
              </Form.Item>
              <Form.Item
                rules={[{ required: true, message: "Please select profile" }]}
                className="w-full sm:w-48 rounded"
                name={"profile_id"}>
                <Select
                  size="large"
                  loading={loading}
                  placeholder="Select Profile"
                  notFoundContent={"No Profiles Found"}
                  options={
                    resumes?.length > 0
                      ? [
                          {
                            label: "Profile",
                            value: "",
                            disabled: true
                          },
                          ...resumes.map((resume) => ({
                            label: resume.name,
                            value: resume._id,
                            disabled: false
                          }))
                        ]
                      : []
                  }
                />
              </Form.Item>

              {/* <Form.Item
                className="w-full sm:w-48 rounded"
                initialValue={null}
                name={"tailoredApply"}>
                <Select
                  allowClear
                  size="large"
                  placeholder="AI Tailored Apply"
                  options={[
                    {
                      label: "AI Tailored Apply",
                      value: "tailoredApply",
                      disabled: true
                    },
                    {
                      label: "Yes",
                      value: "yes"
                    },
                    {
                      label: "No",
                      value: "no"
                    }
                  ]}
                />
              </Form.Item> */}

              <Form.Item className="w-full sm:w-48 rounded" name={"time"}>
                <Select<SearchProps["time"]>
                  size="large"
                  allowClear
                  placeholder="Date Posted"
                  options={[
                    { label: "Any time", value: "" },
                    { label: "Past month", value: "Past month" },
                    { label: "Past week", value: "Past week" },
                    { label: "Past 24 hours", value: "Past 24 hours" }
                  ]}
                />
              </Form.Item>
              <Form.Item className="w-full sm:w-48 rounded" name={"jobType"}>
                <Select
                  size="large"
                  allowClear
                  placeholder="Job Type"
                  options={[
                    { label: "Job Type", disabled: true, value: "jobType" },
                    { label: "Full Time", value: "Full Time" },
                    { label: "Part Time", value: "Part Time" },
                    { label: "Contract", value: "Contract" },
                    { label: "Internship", value: "Internship" }
                  ]}
                />
              </Form.Item>
              <Form.Item className="w-full sm:w-48 rounded" name={"workType"}>
                <Select
                  size="large"
                  allowClear
                  placeholder="Work Type"
                  options={[
                    { label: "Work Type", value: "workType", disabled: true },
                    { label: "On-site", value: "On-site" },
                    { label: "Remote", value: "Remote" },
                    { label: "Hybrid", value: "Hybrid" }
                  ]}
                />
              </Form.Item>
              <Form.Item className="w-full sm:w-48 rounded" name={"experience"}>
                <Select
                  size="large"
                  allowClear
                  placeholder="Experience Level"
                  options={[
                    {
                      label: "Experience Level",
                      value: "experience",
                      disabled: true
                    },
                    { label: "Entry Level", value: "Entry Level" },
                    { label: "Associate", value: "Associate" },
                    { label: "Executive", value: "Executive" }
                  ]}
                />
              </Form.Item>
            </Flex>
          ) : null}
        </Form>

        <GradientButton
          className="flex sm:hidden  justify-center  items-center gap-3 py-3 px-4 mt-2"
          style={{ borderRadius: "60px" }}
          disabled={loading || loadingMain}
          onClick={handleFormSubmit}
          icon={
            loadingMain ? (
              <AiOutlineLoading className="animate-spin" size={20} />
            ) : (
              <img src={buttonIcon} alt="Start Applying Icon" loading="lazy" />
            )
          }>
          Start Applying
        </GradientButton>
      </div>

      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false)
          // Navigate to desired page or close modal
        }}
        context="autoApply"
      />
    </>
  )
}
