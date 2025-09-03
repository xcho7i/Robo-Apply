const generateJobSkillsSystemPrompt = () => {
  const systemPrompt = `You are an expert technical recruiter and skills analyst. Generate focused, relevant skill lists for ANY role based on:
1. The specific job title provided
2. Industry standards and requirements
3. Company context and needs
4. Experience level requirements

Return a comma-separated list of 8-15 relevant skills that are:
- Specific to the job title
- Industry-appropriate
- Mix of technical and soft skills where applicable
- Realistic and in-demand

For non-technical roles (like Project Manager, Marketing Manager, etc.), focus on relevant business skills, tools, and methodologies.`

  return systemPrompt
}

const generateJobSkillsUserPrompt = ({
  job_title,
  companyName,
  years_experience,
  job_description
}) => {
  let userPrompt = `Generate relevant skills for "${
    job_title || "Software Engineer"
  }" at ${companyName}`

  if (years_experience > 0) {
    userPrompt += ` for someone with ${years_experience} years of experience`
  }

  if (job_description) {
    userPrompt += `. Job description context: ${job_description.substring(
      0,
      300
    )}`
  }

  userPrompt += `. Make sure the skills are specifically relevant to the "${job_title}" role and appropriate for this position type.`

  return userPrompt
}

module.exports = {
  generateJobSkillsSystemPrompt,
  generateJobSkillsUserPrompt
}
