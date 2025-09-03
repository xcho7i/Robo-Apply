import React from "react"
import TextAreaComponent from "@/src/components/TextAreaComponent"
import { Resume } from "@types"
import InputItem from "../InputItem"
import SelectItem from "../SelectItem"
import { DatePicker } from "antd"
import dayjs from "dayjs"

interface Props {
  formData: Resume["formData"]
  errors: Resume["formData"]
  setErrors: React.Dispatch<React.SetStateAction<Resume["formData"]>>
  coverLetter: string
  setCoverLetter: React.Dispatch<React.SetStateAction<string>>
  onChange: (key: keyof Resume["formData"], value: string) => void
}

const Miscellaneous = ({
  errors,
  setErrors,
  formData,
  coverLetter,
  setCoverLetter,
  onChange
}: Props) => {
  // Destructure formData
  const {
    remoteSetting,
    hybridSetting,
    siteSetting,
    canStartImmediately,
    experience,
    veteranStatus,
    disability,
    willingToRelocate,
    raceEthnicity,
    noticePeriod,
    expectedSalary,
    expectedSalaryCurrency,
    currentSalary,
    currentSalaryCurrency,
    drivingLicense,
    highestEducation,
    expectedJoiningDate,
    companiesExclude,
    visaSponsorshipStatus,
    securityClearanceStatus,
    countriesAuthorizedToWork,
    currentlyEmployed
  } = formData

  return (
    <>
      <div className="items-center justify-start w-full flex pt-2 pb-7">
        <p className="text-xl font-normal border-b-2 border-purple pb-1">
          Miscellaneous
        </p>
      </div>
      {/* <div className="items-center justify-start w-full flex px-5 pb-3">
        <p className="text-primary">Some fields are not filled.</p>
      </div> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-[100%] md:w-[80%]  ">
        {/* First Row */}
        <div>
          <InputItem
            label="Total Experience (In years)"
            required
            type="number"
            value={experience}
            error={errors.experience}
            onChange={(e) => {
              onChange("experience", e.target.value)
            }}
            placeholder="Total Experience (In years)"
            className="w-full "
          />
        </div>
        {/* <div>
          <SimpleInputField
            value={veteranStatus}
            onChange={(e) => onChange("veteranStatus", e.target.value)}
            placeholder="Veteran Status"
            className="w-full"
          />
        </div> */}
        <div className="w-full items-center flex">
          <SelectItem
            error={errors.veteranStatus}
            label="Veteran Status"
            value={veteranStatus}
            onChange={(e) => onChange("veteranStatus", e.target.value)}>
            <option
              className="text-primary bg-inputBackGround"
              value=""
              disabled>
              Veteran Status
            </option>
            <option className="text-primary bg-inputBackGround" value="Yes">
              Yes
            </option>
            <option className="text-primary bg-inputBackGround" value="No">
              No
            </option>
          </SelectItem>
        </div>

        {/* Second Row */}
        {/* <div>
          <SimpleInputField
            value={disability}
            onChange={(e) => onChange("disability", e.target.value)}
            placeholder="Disability"
            className="w-full"
          />
        </div> */}
        <div className="w-full items-center flex">
          <SelectItem
            error={errors.disability}
            label="Disability"
            value={disability}
            onChange={(e) => onChange("disability", e.target.value)}
            className="">
            <option
              className="text-primary bg-inputBackGround"
              value=""
              disabled>
              Disability
            </option>
            <option className="text-primary bg-inputBackGround" value="Yes">
              Yes
            </option>
            <option className="text-primary bg-inputBackGround" value="No">
              No
            </option>
          </SelectItem>
        </div>

        <div className="w-full items-center flex">
          <SelectItem
            error={errors.willingToRelocate}
            label="Willing to Relocate?"
            value={willingToRelocate}
            onChange={(e) => onChange("willingToRelocate", e.target.value)}
            className="">
            <option
              className="text-primary bg-inputBackGround"
              value=""
              disabled>
              Willing to Relocate?
            </option>
            <option className="text-primary bg-inputBackGround" value="Yes">
              Yes
            </option>
            <option className="text-primary bg-inputBackGround" value="No">
              No
            </option>
          </SelectItem>
        </div>

        {/* Third Row */}
        {/* <div>
          <SimpleInputField
            value={raceEthnicity}
            onChange={(e) => onChange("raceEthnicity", e.target.value)}
            placeholder="Race / Ethnicity"
            className="w-full"
          />
        </div> */}
        <div className="w-full items-center flex">
          <SelectItem
            error={errors.raceEthnicity}
            label="Race / Ethnicity"
            value={raceEthnicity}
            onChange={(e) => onChange("raceEthnicity", e.target.value)}
            className="">
            <option
              className="text-primary bg-inputBackGround"
              value=""
              disabled>
              Race / Ethnicity
            </option>
            <option className="text-primary bg-inputBackGround" value="Asian">
              Asian
            </option>
            <option
              className="text-primary bg-inputBackGround"
              value="Black or African American">
              Black or African American
            </option>
            <option
              className="text-primary bg-inputBackGround"
              value="Hispanic or Latino">
              Hispanic or Latino
            </option>
            <option className="text-primary bg-inputBackGround" value="White">
              White
            </option>
            <option
              className="text-primary bg-inputBackGround"
              value="Native American or Alaska Native">
              Native American or Alaska Native
            </option>
            <option
              className="text-primary bg-inputBackGround"
              value="Native Hawaiian or Other Pacific Islander">
              Native Hawaiian or Other Pacific Islander
            </option>
            <option
              className="text-primary bg-inputBackGround"
              value="Two or More Races">
              Two or More Races
            </option>
            <option
              className="text-primary bg-inputBackGround"
              value="Prefer Not to Say">
              Prefer Not to Say
            </option>
          </SelectItem>
        </div>

        <div>
          <InputItem
            error={errors.noticePeriod}
            label="Notice Period"
            value={noticePeriod}
            onChange={(e) => onChange("noticePeriod", e.target.value)}
            placeholder="Notice Period"
            className="w-full "
          />
        </div>

        {/* Fourth Row */}
        <div>
          <InputItem
            error={errors.expectedSalary}
            label="Expected Salary"
            type="number"
            value={expectedSalary}
            onChange={(e) => onChange("expectedSalary", e.target.value)}
            placeholder="Expected Salary"
            className=""
          />
        </div>
        <div className="w-full items-center flex">
          <SelectItem
            error={errors.expectedSalaryCurrency}
            label="Expected Salary Currency"
            value={expectedSalaryCurrency}
            onChange={(e) => onChange("expectedSalaryCurrency", e.target.value)}
            className="">
            <option
              value=""
              className="text-primary bg-inputBackGround"
              disabled>
              Select Currency
            </option>

            <option className="text-primary bg-inputBackGround" value="USD">
              USD
            </option>
            <option className="text-primary bg-inputBackGround" value="EUR">
              EUR
            </option>
            <option className="text-primary bg-inputBackGround" value="GBP">
              GBP
            </option>
            <option className="text-primary bg-inputBackGround" value="PKR">
              PKR
            </option>
            <option className="text-primary bg-inputBackGround" value="AUD">
              AUD
            </option>
          </SelectItem>
        </div>

        {/* Fifth Row */}
        <div>
          <InputItem
            error={errors.currentSalary}
            label="Current Salary"
            type="number"
            value={currentSalary}
            onChange={(e) => onChange("currentSalary", e.target.value)}
            placeholder="Current Salary"
            className="w-full"
          />
        </div>
        <div className="w-full items-center flex">
          <SelectItem
            error={errors.currentSalaryCurrency}
            label="Current Salary Currency"
            value={currentSalaryCurrency}
            onChange={(e) => onChange("currentSalaryCurrency", e.target.value)}
            className="">
            <option
              value=""
              className="text-primary bg-inputBackGround"
              disabled>
              Select Currency
            </option>
            <option className="text-primary bg-inputBackGround" value="USD">
              USD
            </option>
            <option className="text-primary bg-inputBackGround" value="EUR">
              EUR
            </option>
            <option className="text-primary bg-inputBackGround" value="GBP">
              GBP
            </option>
            <option className="text-primary bg-inputBackGround" value="PKR">
              PKR
            </option>
            <option className="text-primary bg-inputBackGround" value="AUD">
              AUD
            </option>
          </SelectItem>
        </div>

        {/* Sixth Row */}
        <div>
          <InputItem
            error={errors.drivingLicense}
            label="Driving License Number"
            value={drivingLicense}
            onChange={(e) => onChange("drivingLicense", e.target.value)}
            placeholder="Driving License Number"
            className="w-full"
          />
        </div>
        <div className="w-full items-center flex">
          <SelectItem
            error={errors.highestEducation}
            label="Highest Education"
            value={highestEducation}
            onChange={(e) => onChange("highestEducation", e.target.value)}
            className="">
            <option
              className="text-primary bg-inputBackGround"
              value=""
              disabled>
              Select Education Level
            </option>
            <option
              className="text-primary bg-inputBackGround"
              value="High School Diploma">
              High School Diploma
            </option>
            <option
              className="text-primary bg-inputBackGround"
              value="Associate Degree">
              Associate Degree
            </option>
            <option
              className="text-primary bg-inputBackGround"
              value="Bachelor's Degree">
              Bachelor's Degree
            </option>
            <option
              className="text-primary bg-inputBackGround"
              value="Master's Degree">
              Master's Degree
            </option>
            <option
              className="text-primary bg-inputBackGround"
              value="Doctorate (PhD)">
              Doctorate (PhD)
            </option>
          </SelectItem>
        </div>

        {/* Seventh Row - Single Field Taking Half Width */}
        <div className="sm:col-span-1 flex flex-col gap-2">
          <label>Expected Date of Joining</label>
          <DatePicker
            value={
              dayjs(expectedJoiningDate).isValid()
                ? dayjs(expectedJoiningDate)
                : undefined
            }
            placeholder="Expected Date of Joining"
            onChange={(date) => {
              onChange(
                "expectedJoiningDate",
                dayjs(date).isValid() ? dayjs(date).format() : ""
              )
            }}
            size="large"
            className={`w-full  bg-dropdownBackground py-2.5`}
          />
          {errors.expectedJoiningDate && (
            <p className="text-red-500 text-sm">This field is required</p>
          )}
        </div>

        <div className="sm:col-span-1 ">
          <SelectItem
            error={errors.canStartImmediately}
            label="Can you start immediately?"
            value={canStartImmediately}
            onChange={(e) => onChange("canStartImmediately", e.target.value)}
            className="">
            <option
              value=""
              className="text-primary bg-inputBackGround"
              disabled>
              Select
            </option>
            <option value="yes" className="text-primary bg-inputBackGround">
              Yes
            </option>
            <option value="no" className="text-primary bg-inputBackGround">
              No
            </option>
          </SelectItem>
        </div>

        {/* Dropdown: Do you have an active security clearance? */}
        <div className="w-full ">
          <SelectItem
            error={errors.securityClearanceStatus}
            label="Do you have an active security clearance?"
            value={securityClearanceStatus}
            onChange={(e) =>
              onChange("securityClearanceStatus", e.target.value)
            }
            className="">
            <option
              value=""
              className="text-primary bg-inputBackGround"
              disabled>
              Select
            </option>
            <option value="yes" className="text-primary bg-inputBackGround">
              Yes
            </option>
            <option value="no" className="text-primary bg-inputBackGround">
              No
            </option>
          </SelectItem>
        </div>

        <div className="sm:col-span-1 ">
          <SelectItem
            error={errors.remoteSetting}
            label="Are you comfortable working in a remote setting?"
            value={remoteSetting}
            onChange={(e) => onChange("remoteSetting", e.target.value)}
            className="">
            <option
              value=""
              className="text-primary bg-inputBackGround"
              disabled>
              Select
            </option>
            <option value="yes" className="text-primary bg-inputBackGround">
              Yes
            </option>
            <option value="no" className="text-primary bg-inputBackGround">
              No
            </option>
          </SelectItem>
        </div>

        <div className="sm:col-span-1 ">
          <SelectItem
            error={errors.hybridSetting}
            label="Are you comfortable working in a hybrid setting?"
            value={hybridSetting}
            onChange={(e) => onChange("hybridSetting", e.target.value)}
            className="">
            <option
              value=""
              className="text-primary bg-inputBackGround"
              disabled>
              Select
            </option>
            <option value="yes" className="text-primary bg-inputBackGround">
              Yes
            </option>
            <option value="no" className="text-primary bg-inputBackGround">
              No
            </option>
          </SelectItem>
        </div>

        <div className="sm:col-span-1 ">
          <SelectItem
            error={errors.siteSetting}
            label="Are you comfortable working in a site setting?"
            value={siteSetting}
            onChange={(e) => onChange("siteSetting", e.target.value)}
            className="">
            <option
              value=""
              className="text-primary bg-inputBackGround"
              disabled>
              Select
            </option>
            <option value="yes" className="text-primary bg-inputBackGround">
              Yes
            </option>
            <option value="no" className="text-primary bg-inputBackGround">
              No
            </option>
          </SelectItem>
        </div>
        <div className="sm:col-span-1 ">
          <SelectItem
            error={errors.currentlyEmployed}
            label="Are you currently employed?"
            value={currentlyEmployed}
            onChange={(e) => onChange("currentlyEmployed", e.target.value)}
            className="">
            <option
              value=""
              className="text-primary bg-inputBackGround"
              disabled>
              Select
            </option>
            <option value="yes" className="text-primary bg-inputBackGround">
              Yes
            </option>
            <option value="no" className="text-primary bg-inputBackGround">
              No
            </option>
          </SelectItem>
        </div>

        {/* Companies to exclude */}
        <div className="sm:col-span-2">
          <InputItem
            error={errors.companiesExclude}
            value={companiesExclude}
            onChange={(e) => onChange("companiesExclude", e.target.value)}
            placeholder="google, amazon, stripe"
            className="w-full"
            label="Companies to exclude from applying (comma separated) (Optional)"
          />
        </div>

        {/* Dropdown: Will you now, or in the future, require sponsorship for employment visa status? */}
        <div className="sm:col-span-2 ">
          <SelectItem
            error={errors.visaSponsorshipStatus}
            label="Will you now, or in the future, require sponsorship for employment
            visa status?"
            value={visaSponsorshipStatus}
            onChange={(e) => onChange("visaSponsorshipStatus", e.target.value)}
            className="">
            <option
              value=""
              className="text-primary bg-inputBackGround"
              disabled>
              Select
            </option>
            <option value="no" className="text-primary bg-inputBackGround">
              No
            </option>
            <option value="yes" className="text-primary bg-inputBackGround">
              Yes
            </option>
          </SelectItem>
        </div>

        <div className="sm:col-span-2">
          <InputItem
            error={errors.countriesAuthorizedToWork}
            value={countriesAuthorizedToWork}
            onChange={(e) =>
              onChange("countriesAuthorizedToWork", e.target.value)
            }
            placeholder="Pakistan, USA, Australia"
            className="w-full"
            label="Countries you are authorized to work ?(comma separated)"
          />
        </div>
        {/* Cover Letter Textarea */}
        <div className="sm:col-span-2 pb-20">
          <label className="block w-full ml-2 mb-2 text-base font-medium text-primary">
            Your cover letter here...
          </label>
          <TextAreaComponent
            value={coverLetter}
            onTextChange={(text) => setCoverLetter(text)}
            placeholder="Your cover letter here..."
          />
        </div>
      </div>
    </>
  )
}

export default Miscellaneous
