// API Base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// TypeScript interfaces for API responses
export interface SoilDetectionResponse {
  soil_type: string;
  technical_name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface WeatherResponse {
  temperature: number;
  humidity: number;
  rainfall: number;
  weather_description: string;
  location: string;
}

export interface CropRecommendation {
  crop_name: string;
  suitability_score: number;
  market_price?: string | number;
  reason?: string;
}

export interface LocationRecommendationResponse {
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  detected_soil: {
    soil_type: string;
    technical_name: string;
  };
  current_weather: {
    temperature: number;
    humidity: number;
    rainfall: number;
    description: string;
  };
  recommendations: CropRecommendation[];
}

export interface ManualRecommendationResponse {
  recommendations: CropRecommendation[];
}

export interface FeedbackResponse {
  success: boolean;
  message?: string;
}

export interface CommunityPost {
  id?: string;
  author: string;
  title: string;
  content: string;
  date?: string;
  likes?: number;
  comments?: number;
}

export interface CommunityPostResponse {
  success: boolean;
  post_id: string;
}

export interface HistoryItem {
  id?: string;
  user_id: string;
  method: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  recommendations: CropRecommendation[];
  timestamp: string;
}

export interface HistoryResponse {
  success: boolean;
  history_id: string;
}

// API Service Object
export const api = {
  /**
   * Detect soil type based on coordinates
   */
  detectSoil: async (lat: number, lon: number): Promise<SoilDetectionResponse> => {
    console.log(`[API] Detecting soil at coordinates: ${lat}, ${lon}`);
    try {
      const response = await fetch(`${API_BASE_URL}/api/detect-soil`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat, lon }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[API] Soil detection successful:', data);
      return data;
    } catch (error) {
      console.error('[API] Soil detection failed:', error);
      throw error;
    }
  },

  /**
   * Get weather data based on coordinates
   */
  getWeather: async (lat: number, lon: number): Promise<WeatherResponse> => {
    console.log(`[API] Fetching weather for coordinates: ${lat}, ${lon}`);
    try {
      const response = await fetch(`${API_BASE_URL}/api/weather`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat, lon }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[API] Weather fetch successful:', data);
      return data;
    } catch (error) {
      console.error('[API] Weather fetch failed:', error);
      throw error;
    }
  },

  /**
   * Get crop recommendations based on location (auto-detect mode)
   */
  recommendFromLocation: async (lat: number, lon: number): Promise<LocationRecommendationResponse> => {
    console.log(`[API] Getting recommendations for location: ${lat}, ${lon}`);
    try {
      const response = await fetch(`${API_BASE_URL}/api/recommend-from-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat, lon }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Validate and clamp suitability scores to 0-100 range
      if (data.recommendations) {
        data.recommendations = data.recommendations.map((crop: CropRecommendation) => ({
          ...crop,
          suitability_score: Math.min(Math.max(crop.suitability_score || 0, 0), 100)
        }));
      }
      
      console.log('[API] Location-based recommendations successful:', data);
      return data;
    } catch (error) {
      console.error('[API] Location-based recommendations failed:', error);
      throw error;
    }
  },

  /**
   * Get crop recommendations based on manual input
   */
  recommendManual: async (params: {
    N: number;
    P: number;
    K: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
  }): Promise<ManualRecommendationResponse> => {
    console.log('[API] Getting manual recommendations with params:', params);
    try {
      const response = await fetch(`${API_BASE_URL}/api/recommend-manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Validate and clamp suitability scores to 0-100 range
      if (data.recommendations) {
        data.recommendations = data.recommendations.map((crop: CropRecommendation) => ({
          ...crop,
          suitability_score: Math.min(Math.max(crop.suitability_score || 0, 0), 100)
        }));
      }
      
      console.log('[API] Manual recommendations successful:', data);
      return data;
    } catch (error) {
      console.error('[API] Manual recommendations failed:', error);
      throw error;
    }
  },

  /**
   * Submit feedback
   */
  submitFeedback: async (feedback: {
    name: string;
    email: string;
    feedback_type: string;
    message: string;
    rating: number;
  }): Promise<FeedbackResponse> => {
    console.log('[API] Submitting feedback:', feedback);
    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[API] Feedback submission successful:', data);
      return data;
    } catch (error) {
      console.error('[API] Feedback submission failed:', error);
      throw error;
    }
  },

  /**
   * Get all community posts
   */
  getCommunityPosts: async (): Promise<CommunityPost[]> => {
    console.log('[API] Fetching community posts');
    try {
      const response = await fetch(`${API_BASE_URL}/api/community-posts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[API] Community posts fetch successful:', data);
      return data;
    } catch (error) {
      console.error('[API] Community posts fetch failed:', error);
      throw error;
    }
  },

  /**
   * Submit a new community post
   */
  submitPost: async (post: {
    author: string;
    title: string;
    content: string;
  }): Promise<CommunityPostResponse> => {
    console.log('[API] Submitting community post:', post);
    try {
      const response = await fetch(`${API_BASE_URL}/api/community-post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[API] Post submission successful:', data);
      return data;
    } catch (error) {
      console.error('[API] Post submission failed:', error);
      throw error;
    }
  },

  /**
   * Save search to history
   */
  saveHistory: async (historyItem: {
    user_id: string;
    method: string;
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    recommendations: CropRecommendation[];
    timestamp: string;
  }): Promise<HistoryResponse> => {
    console.log('[API] Saving history item:', historyItem);
    try {
      const response = await fetch(`${API_BASE_URL}/api/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(historyItem),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[API] History save successful:', data);
      return data;
    } catch (error) {
      console.error('[API] History save failed:', error);
      throw error;
    }
  },

  /**
   * Get user's search history
   */
  getHistory: async (userId: string): Promise<HistoryItem[]> => {
    console.log(`[API] Fetching history for user: ${userId}`);
    try {
      const response = await fetch(`${API_BASE_URL}/api/history/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[API] History fetch successful:', data);
      return data;
    } catch (error) {
      console.error('[API] History fetch failed:', error);
      throw error;
    }
  },
};

export default api;
