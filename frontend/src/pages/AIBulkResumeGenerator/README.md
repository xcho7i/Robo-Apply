# Sample Excel File Format for AI Bulk Resume Generator

To test the AI Bulk Resume Generator, create an Excel file with the following structure:

## Required Columns:

1. **Job Title** (Required) - Examples: "Software Developer", "Product Manager", "Data Scientist"
2. **Company** (Optional) - Examples: "Google", "Microsoft", "Startup Inc."
3. **Job Description** (Optional) - Full job description text
4. **Skills** (Optional) - Comma-separated skills list

## Sample Data Structure:

| Job Title          | Company   | Job Description                                     | Skills                                     |
| ------------------ | --------- | --------------------------------------------------- | ------------------------------------------ |
| Software Developer | TechCorp  | Develop web applications using React and Node.js... | React, Node.js, JavaScript, TypeScript     |
| Product Manager    | StartupCo | Lead product development and strategy...            | Product Strategy, Analytics, Communication |
| Data Scientist     | DataInc   | Analyze large datasets and build ML models...       | Python, Machine Learning, SQL, Statistics  |

## Instructions:

1. Create an Excel file (.xlsx or .xls) with these columns
2. The system will automatically detect column names containing:
   - Title/Position/Role for job titles
   - Company/Organization/Employer for company names
   - Description/Details/Requirements for job descriptions
   - Skills/Technology/Requirements for skills
3. Skills can be comma-separated or space-separated
4. Only Job Title column is required, others are optional

## Testing Resume Files:

Upload resume files in the following formats:

- PDF (.pdf)
- Word documents (.docx)
- Plain text (.txt)
- Markdown (.md)

The system will extract text content and generate tailored resumes for each job posting.
