import { postRequestWithoutAuth } from "./coverLetterHttpRequests";
import API_ENDPOINTS from "./endpoints";

// Generate AI Cover Letter without auth token
const generateCoverLetter = async (formData) => {
  // Using the custom HTTP function that doesn't include auth headers
  const response = await postRequestWithoutAuth(
    API_ENDPOINTS.AiCoverLetterGenerate,
    formData
  );

  if (response.success) {
    // Store the form data and generated content in localStorage
    localStorage.setItem("coverLetterFormData", JSON.stringify(formData));
    localStorage.setItem("generatedCoverLetter", response.result.coverLetter);
  }

  return response;
};

// Regenerate Cover Letter with existing data without auth token
const regenerateCoverLetter = async () => {
  const savedFormData = localStorage.getItem("coverLetterFormData");

  if (savedFormData) {
    const formData = JSON.parse(savedFormData);
    // Using the custom HTTP function that doesn't include auth headers
    const response = await postRequestWithoutAuth(
      API_ENDPOINTS.AiCoverLetterGenerate,
      formData
    );

    if (response.success) {
      localStorage.setItem("generatedCoverLetter", response.result.coverLetter);
    }

    return response;
  }

  throw new Error("No form data available to regenerate cover letter");
};

// Upload the file without auth token
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("files", file);

  const response = await postRequestWithoutAuth(
    API_ENDPOINTS.FileUpload,
    formData
  );

  if (response.success) {
    console.log("File uploaded successfully:", response.result);
    return response.result; // Return the uploaded file response
  } else {
    console.error("File upload failed:", response.message);
    throw new Error(response.message || "File upload failed");
  }
};

// Submit the file response to resume manager
const submitToResumeManager = async (fileData) => {
  const response = await postRequestWithoutAuth(
    API_ENDPOINTS.ResumeManager,
    fileData
  );

  if (response.success) {
    console.log("Resume manager updated successfully:", response.result);
  } else {
    console.error("Failed to update resume manager:", response.message);
    throw new Error(response.message || "Failed to update resume manager");
  }

  return response;
};

const aiService = {
  generateCoverLetter,
  regenerateCoverLetter,
  uploadFile,
  submitToResumeManager,
};

export default aiService;
