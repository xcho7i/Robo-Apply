# User Onboarding API Documentation

This document describes the API endpoints for handling user onboarding data that users submit after signing in with Google.

## Overview

The user onboarding system allows new users to submit their job search preferences, career information, and other relevant data after completing Google authentication. This data is stored separately from the main user profile to keep the user model clean while maintaining detailed onboarding information.

## Models

### UserOnboarding Model

The `UserOnboarding` model stores all onboarding-related data with the following structure:

```javascript
{
  userId: ObjectId, // Reference to user
  activeCard: Number,
  firstName: String,
  lastName: String,
  jobSearchStatus: String, // "Active Job Seeker", "Passive Job Seeker", "Not Looking"
  challenges: [String],
  hearAboutUs: String,
  employmentStatus: String,
  jobTitle: String,
  salary: Number,
  country: String,
  phone: String,
  resumeName: String,
  resumeData: String,
  resumeType: String,
  selectedOption: String,
  selectedExperienceLevels: [String],
  educationLevel: String, // "High School", "Associate's degree", "Bachelor's degree", "Master's degree", "Doctorate", "Other"
  yearsOfExperience: Number,
  jobSearchGoal: String,
  selectedBlockers: [String],
  selectedGoal: String,
  jobsPerWeek: Number,
  referralCode: String,
  selectedPlan: String,
  currency: {
    name: String,
    symbol: String,
    code: String
  },
  jobSearchGoalLabel: String,
  isCompleted: Boolean,
  deleted: Boolean,
  timestamps: true
}
```

## API Endpoints

### 1. Submit Onboarding Data

**Endpoint:** `POST /api/onboarding/submit`

**Description:** Submit or update user onboarding data after Google sign-in.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "activeCard": 36,
  "firstName": "Mughees",
  "lastName": "Sarwar",
  "jobSearchStatus": "Passive Job Seeker",
  "challenges": [],
  "hearAboutUs": "LinkedIn",
  "employmentStatus": "",
  "jobTitle": "Frontend Developer",
  "salary": 82000,
  "country": "Pakistan",
  "phone": "+923336668292",
  "resumeName": "",
  "resumeData": "",
  "resumeType": "",
  "selectedOption": "",
  "selectedExperienceLevels": [],
  "educationLevel": "Master's degree",
  "yearsOfExperience": 3,
  "jobSearchGoal": "b",
  "selectedBlockers": [],
  "selectedGoal": "",
  "jobsPerWeek": 15,
  "referralCode": "12345",
  "selectedPlan": "",
  "currency": {
    "name": "US Dollar",
    "symbol": "$",
    "code": "USD"
  },
  "jobSearchGoalLabel": "Explore new roles"
}
```

**Response (201 - Created):**
```json
{
  "onboarding": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "userId": "60f7b3b3b3b3b3b3b3b3b3b4",
    "firstName": "Mughees",
    "lastName": "Sarwar",
    "jobSearchStatus": "Passive Job Seeker",
    "isCompleted": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "msg": "Onboarding data submitted successfully",
  "success": true
}
```

**Response (200 - Updated):**
```json
{
  "onboarding": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "userId": "60f7b3b3b3b3b3b3b3b3b3b4",
    "firstName": "Mughees",
    "lastName": "Sarwar Updated",
    "jobSearchStatus": "Active Job Seeker",
    "isCompleted": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  },
  "msg": "Onboarding data updated successfully",
  "success": true
}
```

### 2. Get User Onboarding Data

**Endpoint:** `GET /api/onboarding/data`

**Description:** Retrieve the current user's onboarding data.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "onboarding": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "userId": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "firstName": "Mughees",
      "lastName": "Sarwar",
      "email": "mughees@example.com"
    },
    "firstName": "Mughees",
    "lastName": "Sarwar",
    "jobSearchStatus": "Passive Job Seeker",
    "jobTitle": "Frontend Developer",
    "salary": 82000,
    "country": "Pakistan",
    "isCompleted": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "success": true
}
```

### 3. Update Specific Onboarding Field

**Endpoint:** `PATCH /api/onboarding/update-field`

**Description:** Update a specific field in the user's onboarding data.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "field": "jobSearchStatus",
  "value": "Active Job Seeker"
}
```

**Response (200):**
```json
{
  "onboarding": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "userId": "60f7b3b3b3b3b3b3b3b3b3b4",
    "jobSearchStatus": "Active Job Seeker",
    "updatedAt": "2024-01-15T11:30:00.000Z"
  },
  "msg": "Onboarding field updated successfully",
  "success": true
}
```

### 4. Get Onboarding Status

**Endpoint:** `GET /api/onboarding/status`

**Description:** Check if the user has completed onboarding.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "isCompleted": true,
  "hasOnboardingData": true,
  "success": true
}
```

### 5. Delete Onboarding Data

**Endpoint:** `DELETE /api/onboarding/delete`

**Description:** Soft delete the user's onboarding data.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "msg": "Onboarding data deleted successfully",
  "success": true
}
```

### 6. Get All Onboarding Data (Admin)

**Endpoint:** `GET /api/onboarding/all?page=1&limit=10&search=developer`

**Description:** Retrieve all onboarding data with pagination and search (admin function).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term for firstName, lastName, jobTitle, or country

**Response (200):**
```json
{
  "onboardingData": {
    "docs": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "userId": {
          "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
          "firstName": "Mughees",
          "lastName": "Sarwar",
          "email": "mughees@example.com"
        },
        "firstName": "Mughees",
        "lastName": "Sarwar",
        "jobTitle": "Frontend Developer",
        "country": "Pakistan",
        "isCompleted": true
      }
    ],
    "totalDocs": 1,
    "limit": 10,
    "page": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "success": true
}
```

## Alternative User Route

### Submit Onboarding via User Route

**Endpoint:** `POST /api/user/onboarding`

**Description:** Alternative endpoint for submitting onboarding data through the user controller.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:** Same as `/api/onboarding/submit`

**Response:** Same as `/api/onboarding/submit`

## Error Responses

### 400 Bad Request
```json
{
  "msg": "User ID is required",
  "success": false
}
```

### 401 Unauthorized
```json
{
  "msg": "Authentication required",
  "success": false
}
```

### 404 Not Found
```json
{
  "msg": "Onboarding data not found",
  "success": false
}
```

### 500 Internal Server Error
```json
{
  "msg": "Failed to submit onboarding data",
  "error": "Database connection error",
  "success": false
}
```

## Usage Examples

### Frontend Integration

```javascript
// Submit onboarding data after Google sign-in
const submitOnboarding = async (onboardingData) => {
  try {
    const response = await fetch('/api/onboarding/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(onboardingData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Onboarding submitted successfully');
      return result.onboarding;
    } else {
      throw new Error(result.msg);
    }
  } catch (error) {
    console.error('Onboarding submission failed:', error);
    throw error;
  }
};

// Check onboarding status
const checkOnboardingStatus = async () => {
  try {
    const response = await fetch('/api/onboarding/status', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      return {
        isCompleted: result.isCompleted,
        hasData: result.hasOnboardingData
      };
    }
  } catch (error) {
    console.error('Failed to check onboarding status:', error);
  }
};
```

## Notes

1. **Authentication Required**: All endpoints require a valid JWT token in the Authorization header.
2. **User ID Resolution**: The user ID is automatically extracted from the JWT token.
3. **Soft Delete**: Deleted onboarding data is marked as deleted but not physically removed from the database.
4. **Unique Constraint**: Each user can only have one onboarding record.
5. **Auto-completion**: When onboarding data is submitted, `isCompleted` is automatically set to `true`.
6. **Validation**: The API validates that the user exists before creating/updating onboarding data.

## Database Indexes

The following indexes are recommended for optimal performance:

```javascript
// On userOnboarding collection
db.userOnboarding.createIndex({ "userId": 1 }, { unique: true });
db.userOnboarding.createIndex({ "deleted": 1 });
db.userOnboarding.createIndex({ "firstName": 1 });
db.userOnboarding.createIndex({ "lastName": 1 });
db.userOnboarding.createIndex({ "jobTitle": 1 });
db.userOnboarding.createIndex({ "country": 1 });
``` 