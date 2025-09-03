// Type definition for tailored resume data
export interface TailoredResumeData {
  full_name?: string
  source_content_analysis?: {
    has_email?: boolean
    has_phone?: boolean
    has_location?: boolean
    has_linkedin?: boolean
    has_github?: boolean
    has_social_links?: boolean
    has_relocation_willingness?: boolean
    has_professional_summary?: boolean
    has_skills?: boolean
    has_work_experience?: boolean
    has_education?: boolean
    has_certifications?: boolean
    has_projects?: boolean
    has_languages?: boolean
    has_awards?: boolean
  }
  contact_information?: {
    email?: string
    phone?: string
    location?: string
    linkedin?: string
    github?: string
    website?: string
    social_links?: Array<{
      platform?: string
      url?: string
    }>
    willing_to_relocate?: boolean
  }
  professional_summary?: string
  skills?: string[]
  work_experience?: Array<{
    has_job_title?: boolean
    has_company?: boolean
    has_location?: boolean
    has_start_date?: boolean
    has_end_date?: boolean
    has_responsibilities?: boolean
    job_title?: string
    company?: string
    location?: string
    start_date?: string
    end_date?: string | null
    responsibilities?: string[]
  }>
  education?: Array<{
    has_degree?: boolean
    has_institution?: boolean
    has_location?: boolean
    has_start_year?: boolean
    has_end_year?: boolean
    has_additional_details?: boolean
    degree?: string
    institution?: string
    location?: string
    start_year?: number
    end_year?: number | null
    additional_details?: string
  }>
  certifications?: Array<{
    has_name?: boolean
    has_issuer?: boolean
    has_year?: boolean
    has_credential_url?: boolean
    name?: string
    issuer?: string
    year?: number
    credential_url?: string
  }>
  projects?: Array<{
    has_title?: boolean
    has_description?: boolean
    has_url?: boolean
    title?: string
    description?: string
    url?: string
  }>
  languages?: Array<{
    has_language?: boolean
    has_proficiency?: boolean
    language?: string
    proficiency?: string
  }>
  awards?: Array<{
    has_title?: boolean
    has_issuer?: boolean
    has_year?: boolean
    has_description?: boolean
    title?: string
    issuer?: string
    year?: number
    description?: string
  }>
}
