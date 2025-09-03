const generateJobTitleSystemPrompt = () => {
  const systemPrompt = `You are an expert recruiter and job market analyst. Generate modern, professional job titles that are:
1. Realistic and commonly used in the industry
2. Appropriate for the candidate's experience level
3. Consistent with the target role when provided
4. Suitable for the company context
5. Professional and concise (typically 2-4 words)

Always return just the job title, nothing else.

IMPORTANT: If the existing job title is already appropriate, simply return it without changes. Do not suggest modifications unless the title is clearly unsuitable or outdated.
IF THE USER DOESN'T PROVIDE A JOB TITLE, RETURN SOFTWARE ENGINEER

`

  return systemPrompt
}

const generateJobTitleUserPrompt = ({
  companyName,
  target_role,
  years_experience,
  context
}) => {
  let userPrompt = `Generate a job title for ${companyName}`

  if (target_role) {
    userPrompt += ` for someone targeting a "${target_role}" role`
  }

  if (years_experience > 0) {
    userPrompt += ` with ${years_experience} years of experience`
  }

  if (context) {
    userPrompt += `. Additional context: ${context}`
  }

  return userPrompt
}

module.exports = {
  generateJobTitleSystemPrompt,
  generateJobTitleUserPrompt
}
