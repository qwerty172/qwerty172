import axios from 'axios';
import { CodeGenerationResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 429) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. The operation took too long to complete.');
    }
    
    if (!error.response) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    const errorMessage = error.response?.data?.error || error.message || 'An unexpected error occurred';
    throw new Error(errorMessage);
  }
);

export interface GenerateCodeRequest {
  query: string;
  language: string;
}

export interface GenerateCodeResponse {
  success: boolean;
  data: CodeGenerationResult;
  error?: string;
}

export const generateCode = async (query: string, language: string): Promise<GenerateCodeResponse> => {
  const response = await api.post<GenerateCodeResponse>('/api/generate-code', {
    query,
    language
  });
  
  return response.data;
};

export const checkHealth = async (): Promise<{ success: boolean; message: string }> => {
  const response = await api.get('/api/health');
  return response.data;
};