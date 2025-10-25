import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { verifyLoginOTP } from "../api/auth";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authCheckCount, setAuthCheckCount] = useState(0);
  const navigate = useNavigate();

  // Decode token and extract user info
  const decodeToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return {
        id: decoded.user_id,
        username: decoded.username,
        email: decoded.email,
        first_name: decoded.first_name,
        last_name: decoded.last_name,
        role: decoded.role,
        must_change_password: decoded.must_change_password,
        email_verified: decoded.email_verified
      };
    } catch (error) {
      console.error("Error decoding token:", error);
      throw new Error("Invalid token");
    }
  };

  // Update user data in context and localStorage
  const updateUser = (updatedData) => {
    setUser(prev => {
      if (!prev) return prev;
      
      const updatedUser = { ...prev, ...updatedData };
      return updatedUser;
    });
  };

  // Stable authentication check that runs only when needed
  useEffect(() => {
    const performAuthCheck = () => {
      const token = localStorage.getItem("access_token");
      setAuthCheckCount(prev => prev + 1);
      
      if (token) {
        try {
          const userData = decodeToken(token);
          setUser(userData);
          setIsAuthenticated(true);

          // Redirect if must change password
          if (userData.must_change_password) {
            navigate("/change-password", { replace: true });
          }
        } catch (error) {
          console.error("Auth check error:", error);
          // Cleanup without forcing refresh
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          sessionStorage.clear();
          setIsAuthenticated(false);
          setUser(null);
          // Redirect to login if token is invalid
          navigate("/login", { replace: true });
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false);
    };

    // Initial check only
    performAuthCheck();
  }, [navigate]);

  // Add comprehensive browser history listener to prevent unauthorized navigation
  useEffect(() => {
    const handlePopState = (event) => {
      const token = localStorage.getItem("access_token");
      const currentPath = window.location.pathname;
      const publicRoutes = ['/login', '/change-password', '/change-password-success', '/verify-email', '/blotter', '/unauthorized'];
      const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));
      
      if (!token && !isPublicRoute) {
        // Clear any cached data and force redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setIsAuthenticated(false);
        setUser(null);
        navigate("/login", { replace: true });
      }
    };

    // Also listen for beforeunload to clear history on page refresh
    const handleBeforeUnload = () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        // Clear browser history completely
        window.history.replaceState(null, '', '/login');
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [navigate]);

  const loginWithOTP = async (email, otp) => {
    setIsLoading(true);
    try {
      const authData = await verifyLoginOTP(email, otp);

      if (!authData?.access) {
        throw new Error("OTP verification failed");
      }

      const token = authData.access;
      localStorage.setItem("access_token", token);
      
      // Establish session
      const sessionId = Date.now().toString();
      sessionStorage.setItem('auth_session_id', sessionId);
      sessionStorage.setItem('is_authenticated', 'true');
      sessionStorage.setItem('auth_timestamp', Date.now().toString());
      
      console.log('Login successful, session established:', {
        token: !!token,
        sessionId,
        userRole: authData.user?.role || 'unknown'
      });
      
      // Use the user data from the response directly
      if (authData.user) {
        setUser(authData.user);
        setIsAuthenticated(true);

        // Redirect if must change password
        if (authData.user.must_change_password) {
          navigate("/change-password", { replace: true });
        } else {
          // Redirect based on role using React Router
          redirectUserByRole(authData.user.role);
        }
      } else {
        // Fallback to token decoding if user data not in response
        const userData = decodeToken(token);
        setUser(userData);
        setIsAuthenticated(true);

        if (userData.must_change_password) {
          navigate("/change-password", { replace: true });
        } else {
          redirectUserByRole(userData.role);
        }
      }
      
      return authData;
    } catch (error) {
      console.error("Login error:", error);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      sessionStorage.clear();
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const redirectUserByRole = (role) => {
    switch (role) {
      case 'client':
        navigate("/client", { replace: true });
        break;
      case 'police_officer':
        navigate("/", { replace: true });
        break;
      case 'administrator':
        navigate("/admin", { replace: true });
        break;
      default:
        navigate("/", { replace: true });
    }
  };

  const logout = () => {
    console.log('LOGOUT: Clearing everything');
    
    // Clear all authentication data
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear authentication state
    setIsAuthenticated(false);
    setUser(null);
    setAuthCheckCount(0);
    
    // Clear browser history
    window.history.replaceState(null, '', '/login');
    
    // Clear all caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Clear IndexedDB
    if ('indexedDB' in window) {
      indexedDB.databases().then(databases => {
        databases.forEach(db => {
          indexedDB.deleteDatabase(db.name);
        });
      });
    }
    
    // Navigate to login without forcing refresh
    navigate("/login", { replace: true });
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  return (
    <AuthContext.Provider
      value={{ 
        isAuthenticated, 
        isLoading, 
        user, 
        loginWithOTP, 
        logout,
        updateUser,
        hasRole,
        hasAnyRole
      }}
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