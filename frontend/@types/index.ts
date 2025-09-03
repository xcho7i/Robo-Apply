export type Miscellaneous = {
  experience: string
  veteranStatus: string
  disability: string
  willingToRelocate: string
  raceEthnicity: string
  noticePeriod: string
  expectedSalary: string
  expectedSalaryCurrency: string
  currentSalary: string
  currentSalaryCurrency: string
  drivingLicense: string
  highestEducation:
    | ""
    | "High School Diploma"
    | "Associate Degree"
    | "Bachelor's Degree"
    | "Master's Degree"
    | "Doctorate (PhD)"
  expectedJoiningDate: string
  companiesExclude: string
  visaSponsorshipStatus: "yes" | "no"
  securityClearanceStatus: "yes" | "no"
  countriesAuthorizedToWork: string
  canStartImmediately: "yes" | "no"
  remoteSetting: "yes" | "no"
  siteSetting: "yes" | "no"
  hybridSetting: "yes" | "no"
  currentlyEmployed: "yes" | "no"
}

export type Qualification = {
  institutionName: string
  institutionType: string
  institutionCity: string
  institutionState: string
  major: string
  degreeType: string
  gpa: string
  startDate: string
  endDate: string
  _id: string
}

export type Experience = {
  jobTitle: string
  companyName: string
  location: string
  experienceType: string
  startDate: string
  endDate: string
  description: string
  _id: string
}

export type PersonalInfo = {
  firstName: string
  lastName: string
  email: string
  phoneNo: string
  state: string
  city: string
  country: string
  zipCode: string
  timeZone: "Eastern" | "Central" | "Mountain" | "Pacific" | "Other"
  mailingAddress: string
  countryCode: string
  gender: string
}

export type Language = {
  language: string
  proficiency: string
  _id: string
}

export type Certification = {
  certificationTitle: string
  startDate: string
  endDate: string
  certificationUrl: string
  _id: string
}

export type Skill = {
  skill: string
  yearsOfExperience: string
  _id: string
}

export type SocialLinks = {
  github: string
  linkedin: string
  dribble: string
  portfolio: string
  otherLink: string
}

export type Achievement = {
  awardTitle: string
  issuer: string
  startDate: string
  endDate: string
  description: string
  _id?: string
}

export type Resume = {
  socialMediaLinks: SocialLinks
  personalInformation: PersonalInfo
  formData: Miscellaneous
  _id?: string
  userId?: string
  resumeName: string
  jobTitle: string
  resumeUrl: string
  experiences: Experience[]
  qualifications: Qualification[]
  skills: Skill[]
  languagesList: Language[]
  achievements: Achievement[]
  certifications: Certification[]
  coverLetter: string
  deleted?: string
  isComplete?: boolean
  projects?: []
  createdAt?: string
  updatedAt?: string
  __v?: number
}

export type ResumeState = {
  resume: Resume
  title: string
  dateAddedAt: string
  jobTitle?: string
  updatedAt: string
  _id: string
}

export type Platform = "linkedin" | "dice"

export type SearchProps = {
  q: string
  jobType?: "Full Time" | "Contract" | "Internship" | "Part Time"
  location?: string
  time?: "" | "Past month" | "Past week" | "Past 24 hours"
  experience?: "Entry Level" | "Associate" | "Executive"
  workType?: "On-site" | "Remote" | "Hybrid"
  target: string
  plateform: Platform
  profile_id: string
  tailoredApply: "yes" | "no"
}

export type ResumeList = {
  _id: string
  name: string
  jobTitle: string
  status: "Completed" | "Not Completed"
  updatedAt: string
}

export type Job = {
  company: string
  id: string
  title: string
  url: string
  tabURL: string
  logo: string
  selected?: boolean
  desc?: string
}

export type JobHistory = {
  jobTitle: string
  companyName: string
  platform: string
  resumeId: string
  jobUrl: string
  status?: "applied" | "skipped"
  userId?: string
  deleted?: boolean
  createdAt?: string
  updatedAt?: string
  _id?: string
  __v?: 0
}

export type Question = {
  parentEl: HTMLDivElement
  inputEl: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  label: string
  type: "mcq" | "selection" | "text" | "checkbox" | "date"
  required: boolean
  listbox: boolean
  numeric: boolean
}

export type ShowModalType = {
  type: "showModal"
  job?: Job // Replace with actual Job type
  currentIndex: number
  totalJobsApply: number
  resume: Resume
  response?: {
    message: "applied" | "skipped" | "stop" | "error"
    error?: string
  }
}

export type ScrapperType = {
  type: "getJobs"
  platform: Platform
  params: SearchProps
  excludeCompanies: string[]
  response?: {
    results: Job[]
    error: string
  }
}

export type ApplyData = {
  job: Job
  tailoredResume?: Base64URLString
}[]

type ApplyJobs = {
  type: "applyJobs"
  data: ApplyData
  platform: Platform
  resume: Resume
  response?: {
    message: "applied" | "skipped" | "stop" | "error"
    error?: string
  }[]
}

export type ExternalMessage =
  | ApplyJobs
  | ScrapperType
  | ShowModalType
  | { type: "activateTab"; response?: "Tab Activated!" }
  | {
      type: "isExtensionInstalled"
      response?: { installed: boolean; version: string }
    }

// Helper type to extract response type from message
export type ExtResp<T extends ExternalMessage["type"]> = Extract<
  ExternalMessage,
  { type: T }
> extends { response?: infer R }
  ? R
  : void
