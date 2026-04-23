import axios from 'axios'
import Swal from 'sweetalert2'

// Use environment variable for API base URL, fallback to '/api' for development
const apiBaseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// --- Global Top Loader Logic ---
let activeRequests = 0;
let progressBarElement = null;

const createProgressBar = () => {
  if (document.getElementById('api-progress-bar')) return;
  progressBarElement = document.createElement('div');
  progressBarElement.id = 'api-progress-bar';
  progressBarElement.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(to right, #6366f1, #a855f7);
    z-index: 9999;
    transition: width 0.3s ease, opacity 0.3s ease;
    width: 0%;
    opacity: 0;
    pointer-events: none;
    box-shadow: 0 0 10px #6366f1, 0 0 5px #a855f7;
  `;
  document.body.appendChild(progressBarElement);
};

const showLoader = () => {
  activeRequests++;
  if (activeRequests === 1) {
    createProgressBar();
    if (progressBarElement) {
      progressBarElement.style.opacity = '1';
      progressBarElement.style.width = '30%'; // Jump to 30% quickly
      
      // Simulate progress
      progressBarElement.progressInterval = setInterval(() => {
        const currentWidth = parseFloat(progressBarElement.style.width);
        if (currentWidth < 90) {
          progressBarElement.style.width = currentWidth + (90 - currentWidth) * 0.1 + '%';
        }
      }, 300);
    }
  }
};

const hideLoader = () => {
  activeRequests--;
  if (activeRequests <= 0) {
    activeRequests = 0;
    if (progressBarElement) {
      clearInterval(progressBarElement.progressInterval);
      progressBarElement.style.width = '100%';
      setTimeout(() => {
        if (activeRequests === 0 && progressBarElement) {
          progressBarElement.style.opacity = '0';
          setTimeout(() => {
            if (activeRequests === 0 && progressBarElement) {
              progressBarElement.style.width = '0%';
            }
          }, 300);
        }
      }, 300);
    }
  }
};

// --- Interceptors ---

// Request interceptor for adding auth token and showing loader
api.interceptors.request.use(
  (config) => {
    // Optionally ignore background syncing endpoints by adding a custom flag config.hideLoader
    if (!config.hideLoader) {
      showLoader();
    }
    
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    hideLoader();
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors and hiding loader
api.interceptors.response.use(
  (response) => {
    if (!response.config.hideLoader) hideLoader();
    return response;
  },
  (error) => {
    if (!error.config?.hideLoader) hideLoader();
    
    const status = error.response?.status;
    const errorMessage = error.response?.data?.detail || error.message || 'An unexpected error occurred';
    
    // Only show global alert for severe errors to not annoy users with validation errors
    if (status === 401) {
      console.error('Unauthorized');
      // Let app handle logout
    } else if (status >= 500) {
      Swal.fire({
        icon: 'error',
        title: 'Server Error',
        text: 'The server encountered an issue. Please try again later.',
        background: '#22272B',
        color: '#fff',
        confirmButtonColor: '#6366f1',
      });
    } else if (status !== 400 && status !== 404 && status !== 401 && status !== 422) {
      // Show generic toast for other network errors
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#2A2E33',
        color: '#fff',
      });
      Toast.fire({
        icon: 'error',
        title: 'Connection Issue',
        text: 'Could not connect to the server'
      });
    }
    
    return Promise.reject(error)
  }
)

export default api