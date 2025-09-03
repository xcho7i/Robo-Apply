const generateJobDescriptionSystemPrompt = () => {
  const systemPrompt = `You are an expert recruiter and HR professional. Generate engaging, professional job descriptions that are:
1. Tailored to the specific job title provided
2. Realistic and industry-appropriate
3. ATS-friendly with clear structure
4. Compelling to attract top talent
5. Include relevant responsibilities, requirements, and benefits

Format the description with clear sections and bullet points. Make it realistic and specific to the role.`

  return systemPrompt
}

const generateJobDescriptionUserPrompt = ({
  job_title,
  companyName,
  years_experience,
  context
}) => {
  let userPrompt = `Generate a professional job description for "${
    job_title || "Software Engineer"
  }" at ${companyName}`

  if (years_experience > 0) {
    userPrompt += ` targeting candidates with ${years_experience} years of experience`
  }

  if (context) {
    userPrompt += `. Additional context: ${context}`
  }

  userPrompt += `. Make sure the description is specifically tailored to the "${job_title}" role and includes relevant responsibilities, requirements, and skills for this position.`

  return userPrompt
}

module.exports = {
  generateJobDescriptionSystemPrompt,
  generateJobDescriptionUserPrompt
}
