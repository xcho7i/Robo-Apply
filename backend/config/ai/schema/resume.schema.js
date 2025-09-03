TAILORED_RESUME_SCHEMA = {
  name: "generate_tailored_resume",
  description:
    "Generate a tailored resume based on the provided job title, job description, and original resume. Only include contact information and fields that are present in the original resume text.",
  parameters: {
    type: "object",
    required: [
      "full_name",
      "contact_information",
      "professional_summary",
      "skills",
      "work_experience",
      "education",
      "source_content_analysis",
      "tailoring_score",
    ],
    properties: {
      source_content_analysis: {
        type: "object",
        description:
          "Analysis of what information was found in the original resume text",
        required: [
          "has_email",
          "has_phone",
          "has_location",
          "has_linkedin",
          "has_github",
          "has_social_links",
          "has_relocation_willingness",
          "has_skills",
          "has_work_experience",
          "has_education",
          "has_certifications",
          "has_projects",
          "has_languages",
          "has_awards",
          "has_selected_project_highlights",
          "has_awards_and_recognition",
        ],
        properties: {
          has_email: {
            type: "boolean",
            description:
              "True if an email address was found in the original resume text",
          },
          has_phone: {
            type: "boolean",
            description:
              "True if a phone number was found in the original resume text",
          },
          has_location: {
            type: "boolean",
            description:
              "True if location/address information was found in the original resume text",
          },
          has_linkedin: {
            type: "boolean",
            description:
              "True if LinkedIn profile URL or username was found in the original resume text",
          },
          has_github: {
            type: "boolean",
            description:
              "True if GitHub profile URL or username was found in the original resume text",
          },
          has_social_links: {
            type: "boolean",
            description:
              "True if any other social media links (Twitter, portfolio website, etc.) were found in the original resume text",
          },
          has_relocation_willingness: {
            type: "boolean",
            description:
              "True if any mention of willingness to relocate was found in the original resume text",
          },
          has_skills: {
            type: "boolean",
            description:
              "True if a skills, competencies, or technical skills section was found in the original resume text",
          },
          has_work_experience: {
            type: "boolean",
            description:
              "True if work experience, employment history, or professional experience section was found in the original resume text",
          },
          has_education: {
            type: "boolean",
            description:
              "True if education, academic background, or qualifications section was found in the original resume text",
          },
          has_certifications: {
            type: "boolean",
            description:
              "True if certifications, licenses, or professional credentials section was found in the original resume text",
          },
          has_projects: {
            type: "boolean",
            description:
              "True if projects, portfolio, or key projects section was found in the original resume text",
          },
          has_languages: {
            type: "boolean",
            description:
              "True if languages, language skills, or multilingual abilities section was found in the original resume text",
          },
          has_awards: {
            type: "boolean",
            description:
              "True if awards, honors, achievements, or recognition section was found in the original resume text",
          },
          has_selected_project_highlights: {
            type: "boolean",
            description:
              "True if project highlights, key projects, or notable achievements section was found in the original resume text",
          },
          has_awards_and_recognition: {
            type: "boolean",
            description:
              "True if awards and recognition, honors, or professional recognition section was found in the original resume text",
          },
        },
      },
      full_name: {
        type: "string",
        description:
          "The candidate's full name, exactly as it appears in the original resume.",
      },
      contact_information: {
        type: "object",
        required: [],
        properties: {
          email: {
            type: "string",
            description:
              "The candidate's exact email address as found in the original resume. ONLY include if has_email is true in source_content_analysis.",
          },
          phone: {
            type: "string",
            description:
              "The candidate's exact phone number as found in the original resume. ONLY include if has_phone is true in source_content_analysis.",
          },
          location: {
            type: "string",
            description:
              "The candidate's exact location as found in the original resume. ONLY include if has_location is true in source_content_analysis.",
          },
          linkedin: {
            type: "string",
            description:
              "The candidate's exact LinkedIn profile URL or username as found in the original resume. Include the full URL if provided (e.g., 'https://linkedin.com/in/username' or 'linkedin.com/in/username'). ONLY include if has_linkedin is true in source_content_analysis.",
          },
          github: {
            type: "string",
            description:
              "The candidate's exact GitHub profile URL or username as found in the original resume. Include the full URL if provided (e.g., 'https://github.com/username' or 'github.com/username'). ONLY include if has_github is true in source_content_analysis.",
          },
          website: {
            type: "string",
            description:
              "The candidate's exact personal/professional website or portfolio URL as found in the original resume. Include the full URL if provided. ONLY include if has_social_links is true in source_content_analysis.",
          },
          social_links: {
            type: "array",
            description:
              "Additional social media links found in the original resume (Twitter, Instagram, Behance, etc.). ONLY include if has_social_links is true in source_content_analysis.",
            items: {
              type: "object",
              required: [],
              properties: {
                platform: {
                  type: "string",
                  description:
                    "The name of the social media platform (e.g., Twitter, Instagram, Behance)",
                },
                url: {
                  type: "string",
                  description:
                    "The exact URL or username as found in the original resume",
                },
              },
            },
          },
          willing_to_relocate: {
            type: "boolean",
            description:
              "Willingness to relocate. ONLY include if has_relocation_willingness is true in source_content_analysis.",
          },
        },
        description:
          "Contact details for the candidate. Only include fields that were present in the original resume.",
      },
      professional_summary: {
        type: "string",
        description:
          "A strategically crafted 3-4 sentence professional summary that positions the candidate as the ideal fit for the target role. Must include relevant years of experience, 3-5 key qualifications that match job requirements, and industry-specific terminology from the job posting. This should read like a compelling elevator pitch tailored specifically for this position.",
      },
      skills: {
        type: "array",
        description:
          "Strategically ordered list of the most relevant skills, technologies, and competencies for the target role. Must be reordered to prioritize exact matches with job requirements, using terminology from the job description. Lead with the most critical skills for the position. ONLY include if has_skills is true in source_content_analysis.",
        items: {
          type: "string",
          description:
            "A highly relevant skill, technology, or competency that matches job description requirements. Use exact terminology from the job posting when possible.",
        },
      },
      work_experience: {
        type: "array",
        description:
          "Work experience, starting with the most recent. ONLY include if has_work_experience is true in source_content_analysis.",
        items: {
          type: "object",
          required: [],
          properties: {
            has_job_title: {
              type: "boolean",
              description:
                "True if job title is present for this work experience entry. Tailor it for current job without telling any lies or exaggerations. Use descriptive elements to better reflect contributions and alignment with target role progression (e.g., 'Software Developer (Full-Stack Applications)' or 'Marketing Assistant & Content Strategist').",
            },
            has_company: {
              type: "boolean",
              description:
                "True if company name is present for this work experience entry",
            },
            has_location: {
              type: "boolean",
              description:
                "True if location is present for this work experience entry",
            },
            has_start_date: {
              type: "boolean",
              description:
                "True if start date is present for this work experience entry",
            },
            has_end_date: {
              type: "boolean",
              description:
                "True if end date is present for this work experience entry",
            },
            has_responsibilities: {
              type: "boolean",
              description:
                "True if responsibilities/achievements are present for this work experience entry",
            },
            job_title: {
              type: "string",
              description:
                "The candidate's job title, enhanced to better reflect their contributions and alignment with target role progression. May include descriptive elements (e.g., 'Software Developer (Full-Stack Applications)' or 'Marketing Assistant & Content Strategist') while maintaining core accuracy. ONLY include if has_job_title is true.",
            },
            company: {
              type: "string",
              description:
                "Name of the company/organization. ONLY include if has_company is true.",
            },
            location: {
              type: "string",
              description:
                "City and country (or remote). ONLY include if has_location is true.",
            },
            start_date: {
              type: "string",
              description:
                "Start date in YYYY-MM format. ONLY include if has_start_date is true.",
            },
            end_date: {
              type: ["string", "null"],
              description:
                "End date in YYYY-MM format, or null if currently employed. ONLY include if has_end_date is true.",
            },
            responsibilities: {
              type: "array",
              description:
                "MANDATORY COMPLETE REWRITING WITH ZERO TOLERANCE: EVERY SINGLE work experience bullet point MUST BE rewritten from scratch - NO EXCEPTIONS, NO COMPROMISES. FORCE PERFECT MIRRORING using EXACT IDENTICAL LANGUAGE from job description for EVERY bullet. HYPER-QUANTIFY EVERY achievement with SPECIFIC metrics, percentages, timeframes, and scale - INVENT THEM IF NEEDED, NO BULLET LEFT WITHOUT NUMBERS. ELIMINATE ANY bullet point that doesn't DIRECTLY SUPPORT the target role and REPLACE with relevant content - NO IRRELEVANT BULLETS ALLOWED. INTEGRATE ALL missing skills from job description into work experiences - NO MATTER HOW, FIND A WAY. TRANSFORM job titles to ALIGN with target role terminology - FORCE THE ALIGNMENT. CREATE NEW bullet points if necessary to COVER ALL job requirements - GENERATE UNTIL EVERY REQUIREMENT IS SATISFIED. USE EXACT PHRASES from job description in work experience descriptions - COPY THEM WORD FOR WORD. POSITION candidate as EXCEEDING all requirements, not just meeting them - MAKE THEM SUPERIOR. CRITICAL: If ANY bullet point remains unchanged or irrelevant, the entire tailoring has FAILED. EXECUTE WITH ABSOLUTE FORCE AND COMPLETE COMMITMENT.",
              items: {
                type: "string",
                description:
                  "MANDATORY COMPLETE TRANSFORMATION: Each bullet point MUST BE completely rewritten to DOMINATE job requirements. REQUIRED ELEMENTS: exact keywords from job description (MANDATORY), HYPER-QUANTIFIED metrics (MANDATORY - invent if necessary), commanding action verbs (MANDATORY), and direct relevance to target role (MANDATORY). Transform EVERY mundane task into MEASURABLE business impact with numbers, percentages, scale - NO EXCEPTIONS. FORCE CONNECTION of EVERY skill to specific job requirements with IRREFUTABLE explanations. ABSOLUTELY NO DUTIES - ONLY ACHIEVEMENTS THAT EXCEED REQUIREMENTS. If a bullet doesn't meet ALL these criteria, it MUST BE rewritten until it does. EXECUTE WITH TOTAL COMMITMENT.",
              },
            },
          },
        },
      },
      education: {
        type: "array",
        description:
          "Education history, starting with the most recent. ONLY include if has_education is true in source_content_analysis.",
        items: {
          type: "object",
          required: [],
          properties: {
            has_degree: {
              type: "boolean",
              description:
                "True if degree information is present for this education entry",
            },
            has_institution: {
              type: "boolean",
              description:
                "True if institution name is present for this education entry",
            },
            has_location: {
              type: "boolean",
              description:
                "True if location is present for this education entry",
            },
            has_start_year: {
              type: "boolean",
              description:
                "True if start year is present for this education entry",
            },
            has_end_year: {
              type: "boolean",
              description:
                "True if end year is present for this education entry",
            },
            has_additional_details: {
              type: "boolean",
              description:
                "True if additional details are present for this education entry",
            },
            degree: {
              type: "string",
              description:
                "Degree or qualification earned (e.g., B.Sc. Computer Science). ONLY include if has_degree is true.",
            },
            institution: {
              type: "string",
              description:
                "Name of the school or university. ONLY include if has_institution is true.",
            },
            location: {
              type: "string",
              description:
                "City and country. ONLY include if has_location is true.",
            },
            start_year: {
              type: "integer",
              description:
                "Year the degree program started. ONLY include if has_start_year is true.",
            },
            end_year: {
              type: ["integer", "null"],
              description:
                "Year graduated or expected to graduate. Null if ongoing. ONLY include if has_end_year is true.",
            },
            additional_details: {
              type: "string",
              description:
                "Any honors, GPA, relevant coursework, or thesis (optional). ONLY include if has_additional_details is true.",
            },
          },
        },
      },
      certifications: {
        type: "array",
        description:
          "Relevant certifications. ONLY include if has_certifications is true in source_content_analysis.",
        items: {
          type: "object",
          required: [],
          properties: {
            has_name: {
              type: "boolean",
              description:
                "True if certification name is present for this certification entry",
            },
            has_issuer: {
              type: "boolean",
              description:
                "True if issuer is present for this certification entry",
            },
            has_year: {
              type: "boolean",
              description:
                "True if year is present for this certification entry",
            },
            has_credential_url: {
              type: "boolean",
              description:
                "True if credential URL is present for this certification entry",
            },
            name: {
              type: "string",
              description:
                "Name of the certification. ONLY include if has_name is true.",
            },
            issuer: {
              type: "string",
              description:
                "Issuing organization. ONLY include if has_issuer is true.",
            },
            year: {
              type: "integer",
              description:
                "Year the certification was obtained. ONLY include if has_year is true.",
            },
            credential_url: {
              type: "string",
              description:
                "URL to verify the certification (optional). ONLY include if has_credential_url is true.",
            },
          },
        },
      },
      projects: {
        type: "array",
        description:
          "Significant projects demonstrating relevant skills. ONLY include if has_projects is true in source_content_analysis.",
        items: {
          type: "object",
          required: [],
          properties: {
            has_title: {
              type: "boolean",
              description:
                "True if project title is present for this project entry",
            },
            has_description: {
              type: "boolean",
              description:
                "True if project description is present for this project entry",
            },
            has_url: {
              type: "boolean",
              description:
                "True if project URL is present for this project entry",
            },
            title: {
              type: "string",
              description: "Project name. ONLY include if has_title is true.",
            },
            description: {
              type: "string",
              description:
                "Description of the project and the candidate's role. ONLY include if has_description is true.",
            },
            url: {
              type: "string",
              description:
                "Link to the project or code repository (optional). ONLY include if has_url is true.",
            },
          },
        },
      },
      languages: {
        type: "array",
        description:
          "Languages spoken and proficiency. ONLY include if has_languages is true in source_content_analysis.",
        items: {
          type: "object",
          required: [],
          properties: {
            has_language: {
              type: "boolean",
              description:
                "True if language name is present for this language entry",
            },
            has_proficiency: {
              type: "boolean",
              description:
                "True if proficiency level is present for this language entry",
            },
            language: {
              type: "string",
              description:
                "Language name (e.g., English, Spanish, Urdu). ONLY include if has_language is true.",
            },
            proficiency: {
              type: "string",
              description:
                "Proficiency level (Native, Fluent, Professional, Intermediate, Basic). ONLY include if has_proficiency is true.",
            },
          },
        },
      },
      awards: {
        type: "array",
        description:
          "Awards or honors. ONLY include if has_awards is true in source_content_analysis.",
        items: {
          type: "object",
          required: [],
          properties: {
            has_title: {
              type: "boolean",
              description:
                "True if award title is present for this award entry",
            },
            has_issuer: {
              type: "boolean",
              description:
                "True if award issuer is present for this award entry",
            },
            has_year: {
              type: "boolean",
              description: "True if award year is present for this award entry",
            },
            has_description: {
              type: "boolean",
              description:
                "True if award description is present for this award entry",
            },
            title: {
              type: "string",
              description:
                "Name of the award. ONLY include if has_title is true.",
            },
            issuer: {
              type: "string",
              description:
                "Issuing body or organization. ONLY include if has_issuer is true.",
            },
            year: {
              type: "integer",
              description: "Year received. ONLY include if has_year is true.",
            },
            description: {
              type: "string",
              description:
                "Short description of why the award was given (optional). ONLY include if has_description is true.",
            },
          },
        },
      },
      selected_project_highlights: {
        type: "array",
        description:
          "Key project highlights demonstrating relevant achievements and impact. ONLY include if has_selected_project_highlights is true in source_content_analysis.",
        items: {
          type: "string",
          description:
            "A strategically crafted project highlight that showcases relevant achievements, technical expertise, and quantified impact. Each highlight should be 1-2 sentences describing the project, your role, and the measurable outcomes that align with the target job requirements.",
        },
      },
      awards_and_recognition: {
        type: "array",
        description:
          "Professional awards and recognition that demonstrate excellence and achievement. ONLY include if has_awards_and_recognition is true in source_content_analysis.",
        items: {
          type: "string",
          description:
            "A professionally formatted award or recognition entry that includes the award name, issuing organization, year, and brief context about why it was received. Format: 'Award Name, Organization (Year): Brief description of achievement or context.'",
        },
      },
      tailoring_score: {
        type: "integer",
        minimum: 0,
        maximum: 100,
        description:
          "A comprehensive tailoring score out of 100 that evaluates how well the resume has been optimized for the target job. This score considers: keyword alignment with job description (25%), relevance of work experience bullets to target role (25%), skills prioritization and match (20%), professional summary alignment (15%), overall ATS optimization (10%), and structural completeness (5%). Higher scores indicate better job-specific tailoring and increased likelihood of passing ATS systems and attracting recruiter attention.",
      },
    },
  },
};

module.exports = {
  TAILORED_RESUME_SCHEMA,
};