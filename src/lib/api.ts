// API service for connecting frontend to backend
const API_BASE_URL = 'https://nsvfinserv-api.onrender.com/api';

// Helper function for making API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    throw error;
  }
}

// Auth APIs
export const authAPI = {
  signup: (data: { name: string; email: string; password: string; phone: string }) =>
    apiRequest<{ token: string; user: any }>('/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  login: (data: { email: string; password: string }) =>
    apiRequest<{ token: string; user: any }>('/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  forgotPassword: (data: { email: string }) =>
    apiRequest<{ message: string }>('/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  resetPassword: (data: { token: string; newPassword: string }) =>
    apiRequest<{ message: string }>('/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Services APIs
export const servicesAPI = {
  getAll: () =>
    apiRequest<any[]>('/services', {
      method: 'GET',
    }),
};

// Loan Application APIs
export const loanAPI = {
  submit: (data: { user_id: string; service_id: number; amount: number; ask_expert_id?: number }) =>
    apiRequest<{ message: string; application_id: number }>('/loan-application', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Referral APIs
export const referralAPI = {
  submit: (data: { referrer_id: string; referred_name: string; referred_email: string; referred_phone: string }) =>
    apiRequest<{ message: string; referral_id: number }>('/referral', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Eligibility Calculator APIs
export const eligibilityAPI = {
  submit: (data: { 
    name: string; 
    phone: string; 
    email: string; 
    monthlySalary: number; 
    existingEmi?: number; 
    age?: number; 
    employment?: string; 
    rate?: number; 
    desiredYears?: number; 
    eligibleLoanAmount?: number; 
    affordableEmi?: number; 
  }) =>
    apiRequest<{ message: string; id: number }>('/eligibility-submission', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Reviews APIs
export const reviewsAPI = {
  getAll: () =>
    apiRequest<any[]>('/reviews', {
      method: 'GET',
    }),
  
  submit: (data: { name: string; email: string; phone: string; rating: number; reviewText: string; userId?: string }) =>
    apiRequest<{ message: string; id: number }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Ask Expert APIs
export const expertAPI = {
  submit: (data: { user_id?: string; question: string }) =>
    apiRequest<{ message: string; question_id: number }>('/ask-expert', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Analytics APIs
export const analyticsAPI = {
  trackClick: (data: { page: string; action: string; user_id?: string }) =>
    apiRequest<{ message: string }>('/track-click', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export default {
  authAPI,
  servicesAPI,
  loanAPI,
  referralAPI,
  eligibilityAPI,
  reviewsAPI,
  expertAPI,
  analyticsAPI,
};