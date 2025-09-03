import axios from "axios";

// If you want to use just the base URL string
const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com";

// Custom post request function that doesn't include auth token
export const postRequestWithoutAuth = async (endpoint, payload) => {
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log("🔗 API URL:", fullUrl);

  try {
    const response = await axios.post(fullUrl, payload, {
      headers: {
        "Content-Type":
          payload instanceof FormData
            ? "multipart/form-data"
            : "application/json",
        Accept: "application/json, text/plain, */*",
      },
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    } else if (error.request) {
      throw { message: "No response received from server" };
    } else {
      throw { message: error.message };
    }
  }
};
