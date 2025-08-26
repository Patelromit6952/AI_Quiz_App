import { useState, useEffect } from "react";
import AuthContext from "../../Contexts/AuthContext";
import apiService from "../../services/apiService";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await apiService.getProfile();
        if (response.success) {
          setUser(response.data);
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      if (!credentials.email || !credentials.password) {
        return {
          success: false,
          error: "Email and password are required",
        };
      }

      console.log("AuthProvider: Attempting login with:", credentials.email);

      const response = await apiService.login(credentials);
      console.log("AuthProvider: Full API response:", response);
      
      if (response.success && response.user && response.token) {
        console.log("AuthProvider: Login successful, setting user:", response.user);
        
        // Set user state immediately
        setUser(response.user);
        
        // Save token to localStorage
        localStorage.setItem("token", response.token);
        console.log("AuthProvider: Token saved to localStorage");
        
        return { success: true };
      }

      return {
        success: false,
        error: response.message || "Login failed",
      };
    } catch (error) {
      console.error("AuthProvider: Login error:", error);
      return {
        success: false,
        error: error.message || "Network error. Please try again.",
      };
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("token");
    }
  };

  const register = async (userData) => {
    try {
      if (!userData.email || !userData.password || !userData.username) {
        return {
          success: false,
          error: "Email, username and password are required"
        };
      }

      console.log("AuthProvider: Attempting registration with:", userData.email);

      const response = await apiService.register(userData);
      console.log("AuthProvider: Registration response:", response);
      
      if (response.success && response.user && response.token) {
        console.log("AuthProvider: Registration successful, setting user:", response.user);
        
        // Set user state immediately
        setUser(response.user);
        
        // Save token to localStorage
        localStorage.setItem("token", response.token);
        console.log("AuthProvider: Token saved to localStorage after registration");
        
        return { success: true };
      }

      return {
        success: false,
        error: response.message || "Registration failed"
      };
    } catch (error) {
      console.error("AuthProvider: Registration error:", error);
      return {
        success: false,
        error: error.message || "Registration failed. Please try again."
      };
    }
  };

  // Debug effect to watch user state changes
  useEffect(() => {
    console.log("User state changed to:", user);
    if (user) {
      console.log("User is now logged in:", user);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;