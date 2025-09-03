import API_ENDPOINTS from "./endpoints";
import { postRequest, getRequest, patchRequest } from "./httpRequests";

// 1. GET Get Onboarding Data
const getOnboardingData = async () => {
  const response = await getRequest(API_ENDPOINTS.GetOnboardingData);
  return response;
};

// 2. PATCH Update Onboarding Data
const createOnboardingData = async (onboardingData: Partial<any>) => {
  const response = await postRequest(
    API_ENDPOINTS.CreateOnboardingData,
    onboardingData
  );
  return response;
};
const updateOnboardingData = async (onboardingData: Partial<any>) => {
  const response = await patchRequest(
    API_ENDPOINTS.UpdateOnboardingData,
    onboardingData
  );
  return response;
};

// 3. POST Complete Onboarding
const completeOnboarding = async (onboardingData: any) => {
  const response = await postRequest(
    API_ENDPOINTS.CompleteOnboarding,
    onboardingData
  );
  return response;
};

// 4. POST Skip Onboarding
const skipOnboarding = async () => {
  const response = await postRequest(API_ENDPOINTS.SkipOnboarding);
  return response;
};

const onboardingService = {
  getOnboardingData,
  updateOnboardingData,
  completeOnboarding,
  skipOnboarding,
  createOnboardingData,
};

export default onboardingService;
