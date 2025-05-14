import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { login as authLogin, logout as authLogout } from "../api/auth";
import { jwtDecode } from "jwt-decode";
import { last } from "lodash";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null); // Store user data

  // Decode token and extract user info
  const decodeToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return {
        username: decoded.username,
        email: decoded.email,
        first_name: decoded.first_name,
        last_name: decoded.last_name,
        role: decoded.role,
      };
    } catch (error) {
      throw new Error("Invalid token");
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          setUser(decodeToken(token));
          setIsAuthenticated(true);
        } catch {
          // If token is invalid, clear it
          localStorage.removeItem("access_token");
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const authData = await authLogin(username, password);

      if (!authData?.access) {
        throw new Error("Authentication failed");
      }

      const token = authData.access;
      localStorage.setItem("access_token", token);
      const userData = decodeToken(token);

      setUser(userData);
      setIsAuthenticated(true);
      if(userData.role === 'client') {
        window.location.href = '/client';
      }
      else if (userData.role === 'police_officer') {
        window.location.href = '/police';
      }
      else if (userData.role === 'administrator') {
        window.location.href = '/admin';
      }
    } catch (error) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setIsAuthenticated(false);
      setUser(null);

      // Pass through the error message from auth.ts
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authLogout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
