import { Resume } from "@types"

function requiredFieldsChecker(
  data: Record<string, any>,
  requiredFields: string[]
) {
  let missingFields = {}
  console.log({ data })

  // Helper function to check if a value is empty
  const isEmpty = (value: any): boolean => {
    if (value === undefined || value === null) return true
    if (typeof value === "string" && value.trim() === "") return true
    if (Array.isArray(value) && value.length === 0) return true
    if (typeof value === "object" && Object.keys(value).length === 0)
      return true
    return false
  }

  // Check required fields
  for (const field of requiredFields) {
    if (isEmpty(data?.[field])) missingFields[field] = true
  }

  return missingFields
}

export function isRequiredFieldsFilled(data: Resume) {
  const requirePersonalFields: (keyof Resume["personalInformation"])[] = [
    "firstName",
    "lastName",
    "city",
    "state",
    "country",
    "email",
    "phoneNo",
    "countryCode",
    "gender",
    "timeZone",
    "zipCode",
    "mailingAddress"
  ]
  const requireFormFields: (keyof Resume["formData"])[] = [
    "experience",
    "disability",
    "canStartImmediately",
    "remoteSetting",
    "siteSetting",
    "hybridSetting",
    "countriesAuthorizedToWork",
    "visaSponsorshipStatus",
    "securityClearanceStatus",
    "veteranStatus",
    "expectedSalary",
    "expectedSalaryCurrency",
    "raceEthnicity",
    "highestEducation",
    "expectedJoiningDate",
    "currentlyEmployed"
  ]

  let missingPersonalFields: any = requiredFieldsChecker(
    data.personalInformation,
    requirePersonalFields
  )
  let missingFormFields: any = requiredFieldsChecker(
    data.formData,
    requireFormFields
  )

  if (
    Object.keys(missingPersonalFields).length > 0 ||
    Object.keys(missingFormFields).length > 0
  ) {
    return {
      success: false,
      message: "Please fill in all required fields",
      missingPersonalFields,
      missingFormFields
    }
  }
  return { success: true }
}

export function isNameOkay(a: string, b: string): boolean {
  if (a[0] !== b[0]) return false

  const aTail = a.slice(1)
  const bTail = b.slice(1)

  const lenA = aTail.length
  const lenB = bTail.length

  if (lenA === lenB) {
    // One substitution allowed
    let diff = 0
    for (let i = 0; i < lenA; i++) {
      if (aTail[i] !== bTail[i]) {
        diff++
        if (diff > 1) return false
      }
    }
    return diff === 1 || diff === 0
  }

  if (Math.abs(lenA - lenB) === 1) {
    // One insertion or deletion allowed
    const [shorter, longer] = lenA < lenB ? [aTail, bTail] : [bTail, aTail]
    let i = 0,
      j = 0
    let skipped = false

    while (i < shorter.length && j < longer.length) {
      if (shorter[i] !== longer[j]) {
        if (skipped) return false
        skipped = true
        j++
      } else {
        i++
        j++
      }
    }
    return true
  }

  return false
}
