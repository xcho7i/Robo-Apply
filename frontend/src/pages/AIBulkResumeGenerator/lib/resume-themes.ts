// Modern resume themes and styling options

export const RESUME_THEMES = {
  professional: {
    name: "Professional Blue",
    primaryColor: "2D5AA0",
    secondaryColor: "666666",
    accentColor: "4A90E2",
    description: "Clean, professional design with blue accents",
  },
  modern: {
    name: "Modern Teal",
    primaryColor: "008B8B",
    secondaryColor: "555555",
    accentColor: "20B2AA",
    description: "Contemporary design with teal highlights",
  },
  elegant: {
    name: "Elegant Navy",
    primaryColor: "1B365D",
    secondaryColor: "6C757D",
    accentColor: "495057",
    description: "Sophisticated navy theme for executive roles",
  },
  creative: {
    name: "Creative Purple",
    primaryColor: "6A5ACD",
    secondaryColor: "4B4B4D",
    accentColor: "9370DB",
    description: "Creative design with purple accents",
  },
} as const;

export type ThemeName = keyof typeof RESUME_THEMES;

export const FONT_FAMILIES = {
  arial: "Arial",
  calibri: "Calibri",
  times: "Times New Roman",
  georgia: "Georgia",
} as const;

export const RESUME_SECTIONS = {
  PERSONAL_INFO: "Personal Information",
  SUMMARY: "Professional Summary",
  EXPERIENCE: "Professional Experience",
  SKILLS: "Core Competencies",
  EDUCATION: "Education",
  PROJECTS: "Projects & Achievements",
  CERTIFICATIONS: "Certifications & Awards",
} as const;

// ATS-friendly keywords by industry
export const INDUSTRY_KEYWORDS = {
  technology: [
    "software development",
    "programming",
    "debugging",
    "testing",
    "agile",
    "scrum",
    "API",
    "database",
    "cloud computing",
    "DevOps",
  ],
  marketing: [
    "digital marketing",
    "SEO",
    "SEM",
    "social media",
    "content creation",
    "analytics",
    "campaign management",
    "brand strategy",
    "lead generation",
  ],
  finance: [
    "financial analysis",
    "budgeting",
    "forecasting",
    "risk management",
    "compliance",
    "audit",
    "investment",
    "portfolio management",
    "accounting",
  ],
  sales: [
    "sales strategy",
    "lead generation",
    "client relationship",
    "negotiation",
    "CRM",
    "quota achievement",
    "territory management",
    "business development",
  ],
} as const;

export function getOptimalKeywords(
  jobDescription: string,
  industry?: keyof typeof INDUSTRY_KEYWORDS
): string[] {
  const keywords: string[] = [];

  // If industry specified, include relevant keywords
  if (industry && INDUSTRY_KEYWORDS[industry]) {
    keywords.push(...INDUSTRY_KEYWORDS[industry]);
  }

  // Extract keywords from job description
  const commonTechWords = [
    "javascript",
    "typescript",
    "react",
    "node",
    "python",
    "java",
    "sql",
    "aws",
    "docker",
    "kubernetes",
    "git",
    "agile",
    "scrum",
    "api",
    "rest",
  ];

  const jobLower = jobDescription.toLowerCase();
  commonTechWords.forEach((word) => {
    if (jobLower.includes(word) && !keywords.includes(word)) {
      keywords.push(word);
    }
  });

  return keywords;
}
