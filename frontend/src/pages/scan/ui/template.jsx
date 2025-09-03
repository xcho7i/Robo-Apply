import React, { useState, useEffect } from "react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

const Template = ({ downloadAsPDF, viewOn, setViewOn }) => {
  const [resumeData, setResumeData] = useState({
    name: "",
    title: "",
    email: "",
    address: "",
    website: "",
    summary: "",
    skills: [[], [], []],
    experience: [],
    education: [],
    additional: {
      languages: "",
      certifications: "",
      awards: ""
    }
  })

  const [isEditing, setIsEditing] = useState(false)

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem("resumeParsedData")
      if (storedData) {
        const parsedData = JSON.parse(storedData)

        // Map the parsed data to match the expected structure
        const mappedData = {
          name: parsedData.name || "",
          title: parsedData.title || "",
          email: parsedData.email || "",
          address: parsedData.address || "",
          website: parsedData.website || "",
          summary: parsedData.summary || "",
          skills: parsedData.skills || [[], [], []],
          experience: parsedData.experience || [],
          education: parsedData.education || [],
          additional: {
            languages: parsedData.additional?.languages || "",
            certifications: parsedData.additional?.certifications || "",
            awards: parsedData.additional?.awards || ""
          }
        }

        setResumeData(mappedData)
      }
    } catch (error) {
      console.error("Error loading resume data from localStorage:", error)
      // Keep default empty state if there's an error
    }
  }, [])

  const handleChange = (key, value) => {
    setResumeData({ ...resumeData, [key]: value })
  }

  const handleEditArray = (section, index, key, value) => {
    const updatedSection = [...resumeData[section]]
    updatedSection[index][key] = value
    setResumeData({ ...resumeData, [section]: updatedSection })
  }

  const handleAddSkill = (categoryIndex) => {
    const updatedSkills = [...resumeData.skills]
    updatedSkills[categoryIndex].push("") // Add an empty skill to the category
    setResumeData({ ...resumeData, skills: updatedSkills })
  }

  const handleRemoveSkill = (categoryIndex, skillIndex) => {
    const updatedSkills = [...resumeData.skills]
    updatedSkills[categoryIndex].splice(skillIndex, 1) // Remove the skill at skillIndex
    setResumeData({ ...resumeData, skills: updatedSkills })
  }

  const handleAddExperience = () => {
    const updatedExperience = [
      ...resumeData.experience,
      { title: "", duration: "", responsibilities: [""] }
    ]
    setResumeData({ ...resumeData, experience: updatedExperience })
  }

  const handleRemoveExperience = (index) => {
    const updatedExperience = [...resumeData.experience]
    updatedExperience.splice(index, 1) // Remove the experience at index
    setResumeData({ ...resumeData, experience: updatedExperience })
  }

  const handleAddEducation = () => {
    const updatedEducation = [
      ...resumeData.education,
      { degree: "", duration: "", institution: "", details: "" }
    ]
    setResumeData({ ...resumeData, education: updatedEducation })
  }

  const handleRemoveEducation = (index) => {
    const updatedEducation = [...resumeData.education]
    updatedEducation.splice(index, 1) // Remove the education at index
    setResumeData({ ...resumeData, education: updatedEducation })
  }

  const handleAddAdditional = () => {
    setResumeData({
      ...resumeData,
      additional: { languages: "", certifications: "", awards: "" }
    })
  }

  const handleSetEditing = () => {
    setViewOn(!viewOn)
    setIsEditing(!isEditing)
  }

  // Helper function to check if a job entry has content
  const hasJobContent = (job) => {
    return (
      job.title.trim() !== "" ||
      job.duration.trim() !== "" ||
      (job.responsibilities &&
        job.responsibilities.some((resp) => resp.trim() !== ""))
    )
  }

  return (
    <div className="w-full p-3 md:p-6 bg-white shadow-md text-black">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg md:text-2xl font-bold">Resume Template</h1>
        <div className="flex space-x-4">
          <button
            onClick={handleSetEditing}
            className="px-4 py-2 bg-[#9A3CF9] text-white rounded hover:bg-blue-600">
            {isEditing ? "View" : "Edit"}
          </button>
          {/* <button
              onClick={downloadAsPDF}
              className="px-4 py-2 bg-[#9A3CF9] text-white rounded hover:bg-blue-600"
            >
              Download as PDF
            </button> */}
        </div>
      </div>

      <div id="template">
        {/* Header */}
        <header className="mb-6 text-left">
          {isEditing ? (
            <>
              <input
                type="text"
                className="text-xl md:text-2xl font-bold w-full mb-2"
                value={resumeData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              <input
                type="text"
                className="text-xl md:text-2xl font-semibold w-full mb-2"
                value={resumeData.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
              <input
                type="text"
                className="w-full mb-2"
                value={resumeData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
              <input
                type="email"
                className="w-full mb-2"
                value={resumeData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              <input
                type="url"
                className="w-full"
                value={resumeData.website}
                onChange={(e) => handleChange("website", e.target.value)}
              />
            </>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-bold">
                {resumeData.name}
              </h1>
              <h2 className="text-base md:text-2xl font-semibold">
                {resumeData.title}
              </h2>
              <p className="p-2 text-sm">
                {resumeData.address} | {resumeData.email} | {resumeData.website}
              </p>
            </>
          )}
        </header>

        {/* Summary */}
        <section className="mb-8">
          <h3 className="text-base md:text-lg font-semibold bg-gray-200 p-2 rounded-lg w-[95%]">
            SUMMARY
          </h3>
          {isEditing ? (
            <textarea
              className="w-full h-20 mt-2"
              value={resumeData.summary}
              onChange={(e) => handleChange("summary", e.target.value)}
            />
          ) : (
            <p className="w-[95%] text-sm md:text-lg p-2">
              {resumeData.summary}
            </p>
          )}
        </section>

        {/* Skills */}
        <section className="mb-8">
          <h3 className="text-base md:text-lg font-semibold bg-gray-200 p-2 rounded-lg w-[95%]">
            TECHNICAL SKILLS
          </h3>
          <div className="grid grid-cols-3 md:gap-4">
            {isEditing
              ? resumeData.skills.map((category, categoryIndex) => (
                  <ul
                    key={categoryIndex}
                    className="list-disc justify-between py-2 md:px-2 md:ml-6">
                    {category.map((skill, skillIndex) => (
                      <li
                        key={skillIndex}
                        className="mb-1 ml-2 text-xs md:text-base">
                        <div className="md:flex items-center">
                          <input
                            type="text"
                            className="w-full p-1 mb-2 mt-5"
                            value={skill}
                            onChange={(e) =>
                              handleEditArray(
                                "skills",
                                categoryIndex,
                                skillIndex,
                                e.target.value
                              )
                            }
                          />
                          <button
                            onClick={() =>
                              handleRemoveSkill(categoryIndex, skillIndex)
                            }
                            className="text-sm md:text-base text-red-500 md:ml-2">
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                    <button
                      onClick={() => handleAddSkill(categoryIndex)}
                      className="text-sm md:text-base text-blue-500 ml-2">
                      Add Skill
                    </button>
                  </ul>
                ))
              : resumeData.skills
                  .filter((category) =>
                    // Filter out categories with no valid skills
                    category.some((skill) => skill.trim() !== "")
                  )
                  .map((category, categoryIndex) => (
                    <ul
                      key={categoryIndex}
                      className="list-disc justify-between py-2 md:px-2 md:ml-6">
                      {category
                        .filter((skill) => skill.trim() !== "") // Filter out empty skills
                        .map((skill, skillIndex) => (
                          <li
                            key={skillIndex}
                            className="mb-1 ml-2 text-xs md:text-base">
                            {skill}
                          </li>
                        ))}
                    </ul>
                  ))}
          </div>
        </section>

        {/* Experience */}
        <section className="mb-8">
          <h3 className="text-sm md:text-lg font-semibold bg-gray-200 p-2 rounded-lg w-[95%]">
            PROFESSIONAL EXPERIENCE
          </h3>
          {resumeData.experience.map((job, index) => (
            <div key={index} className="mb-4">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    className="font- w-full mb-2 mt-5"
                    placeholder="Company Name"
                    value={job.title}
                    onChange={(e) =>
                      handleEditArray(
                        "experience",
                        index,
                        "title",
                        e.target.value
                      )
                    }
                  />
                  <input
                    type="text"
                    className="w-full mb-2"
                    placeholder="From - To"
                    value={job.duration}
                    onChange={(e) =>
                      handleEditArray(
                        "experience",
                        index,
                        "duration",
                        e.target.value
                      )
                    }
                  />
                  <textarea
                    className="w-full"
                    placeholder="Description"
                    value={job.responsibilities.join("\n")}
                    onChange={(e) =>
                      handleEditArray(
                        "experience",
                        index,
                        "responsibilities",
                        e.target.value.split("\n")
                      )
                    }
                  />
                  <button
                    onClick={() => handleRemoveExperience(index)}
                    className="text-red-500 p-2">
                    Remove Experience
                  </button>
                </>
              ) : (
                /* Only render job entry if it has content */
                hasJobContent(job) && (
                  <div className="p-2">
                    <h4 className="text-sm md:text-lg font-bold">
                      {job.title}
                    </h4>
                    <p className="text-sm md:text-lg font-normal ">
                      {job.duration}
                    </p>
                    <ul className="list-disc ml-6">
                      {job.responsibilities
                        .filter((resp) => resp.trim() !== "") // Filter out empty responsibilities
                        .map((resp, idx) => (
                          <li key={idx} className="text-sm md:text-lg">
                            {resp}
                          </li>
                        ))}
                    </ul>
                  </div>
                )
              )}
            </div>
          ))}
          {isEditing && (
            <button
              onClick={handleAddExperience}
              className="text-blue-500 px-2">
              Add Experience
            </button>
          )}
        </section>

        {/* Education */}
        <section className="mb-8">
          <h3 className="text-base md:text-lg font-semibold bg-gray-200 p-2 rounded-lg w-[95%]">
            EDUCATION
          </h3>
          {resumeData.education.map((edu, index) => (
            <div key={index} className="mb-4">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    placeholder="Degree Name"
                    className=" w-full mb-2 mt-5"
                    value={edu.degree}
                    onChange={(e) =>
                      handleEditArray(
                        "education",
                        index,
                        "degree",
                        e.target.value
                      )
                    }
                  />
                  <input
                    type="text"
                    className="w-full mb-2"
                    placeholder="From - To"
                    value={edu.duration}
                    onChange={(e) =>
                      handleEditArray(
                        "education",
                        index,
                        "duration",
                        e.target.value
                      )
                    }
                  />
                  <input
                    type="text"
                    className="w-full mb-2"
                    placeholder="Institution"
                    value={edu.institution}
                    onChange={(e) =>
                      handleEditArray(
                        "education",
                        index,
                        "institution",
                        e.target.value
                      )
                    }
                  />
                  <textarea
                    className="w-full"
                    placeholder="Description"
                    value={edu.details}
                    onChange={(e) =>
                      handleEditArray(
                        "education",
                        index,
                        "details",
                        e.target.value
                      )
                    }
                  />
                  <button
                    onClick={() => handleRemoveEducation(index)}
                    className="text-red-500 ml-2">
                    Remove Education
                  </button>
                </>
              ) : (
                <>
                  {/* <div className="p-2 flex">
                    <h4 className="font-bold text-base md:text-lg">
                      {edu.degree}
                    </h4>
                    <p className="text-sm md:text-lg font-semibold">
                      {edu.institution}
                    </p>
                    <p className="text-sm md:text-lg ">{edu.duration}</p>
                    <p className="text-sm md:text-lg ">{edu.details}</p>
                  </div> */}
                  <div className="p-2">
                    <h4 className="font-bold text-base md:text-lg">
                      {edu.degree}
                    </h4>
                    <p className="text-sm md:text-lg ">{edu.duration}</p>
                    <p className="text-sm md:text-lg font-normal">
                      {edu.institution}
                    </p>
                    <p className="text-sm md:text-lg ">{edu.details}</p>
                  </div>
                </>
              )}
            </div>
          ))}
          {isEditing && (
            <button onClick={handleAddEducation} className="text-blue-500 p-2">
              Add Education
            </button>
          )}
        </section>

        {/* Additional Information */}
        <section className="">
          <h3 className="text-sm md:text-lg font-semibold bg-gray-200 p-2 rounded-lg w-[95%]">
            ADDITIONAL INFORMATION
          </h3>
          {isEditing ? (
            <>
              <input
                className="w-full mt-2"
                placeholder="Languages"
                value={resumeData.additional.languages}
                onChange={(e) =>
                  handleChange("additional", {
                    ...resumeData.additional,
                    languages: e.target.value
                  })
                }
              />
              <input
                className="w-full mt-2"
                placeholder="Certifications"
                value={resumeData.additional.certifications}
                onChange={(e) =>
                  handleChange("additional", {
                    ...resumeData.additional,
                    certifications: e.target.value
                  })
                }
              />
              <input
                className="w-full mt-2"
                placeholder="Awards"
                value={resumeData.additional.awards}
                onChange={(e) =>
                  handleChange("additional", {
                    ...resumeData.additional,
                    awards: e.target.value
                  })
                }
              />
            </>
          ) : (
            <div className="flex flex-col gap-2 pb-10 p-2">
              {resumeData.additional.languages && (
                <p className="text-sm md:text-lg">
                  <strong>Languages:</strong> {resumeData.additional.languages}
                </p>
              )}
              {resumeData.additional.certifications && (
                <p className="text-sm md:text-lg">
                  <strong>Certifications:</strong>{" "}
                  {resumeData.additional.certifications}
                </p>
              )}
              {resumeData.additional.awards && (
                <p className="text-sm md:text-lg">
                  <strong>Awards:</strong> {resumeData.additional.awards}
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Template
