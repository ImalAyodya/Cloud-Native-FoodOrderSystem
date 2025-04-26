import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

class AuthService {
  login(email, password) {
    return axios
      .post(`${API_URL}/login`, { email, password })
      .then(response => {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('loggedInUser', JSON.stringify({
            id: response.data.user._id,
            name: response.data.user.name,
            email: response.data.user.email,
            role: response.data.user.role,
          }));
          
          // Set authorization header for all future requests
          this.setAuthHeader(response.data.token);
        }
        
        return response.data;
      });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    
    // Remove authorization header
    this.removeAuthHeader();
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('loggedInUser'));
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated() {
    const token = this.getToken();
    return !!token; // Convert to boolean
  }

  setAuthHeader(token) {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  removeAuthHeader() {
    delete axios.defaults.headers.common['Authorization'];
  }

  // Initialize auth header from storage (call this on app startup)
  initializeAuth() {
    const token = this.getToken();
    if (token) {
      this.setAuthHeader(token);
    }
  }
}

export default new AuthService();