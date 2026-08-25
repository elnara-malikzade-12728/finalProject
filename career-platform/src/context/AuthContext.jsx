import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../api/authApi.js";
import {
  getApiErrorMessage,
  getToken,
} from "../api/client.js";
import {
  getProfile,
  updateProfile as updateProfileRequest,
} from "../api/profileApi.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] =
    useState(true);

  const refreshUser = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setUser(null);
      setIsInitializing(false);
      return null;
    }

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      return currentUser;
    } catch {
      logoutUser();
      setUser(null);

      return null;
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function initializeAuthentication() {
      const token = getToken();

      if (!token) {
        setUser(null);
        setIsInitializing(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser({
          signal: controller.signal,
        });

        setUser(currentUser);
      } catch (error) {
        if (error.name !== "AbortError") {
          logoutUser();
          setUser(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsInitializing(false);
        }
      }
    }

    initializeAuthentication();

    return () => {
      controller.abort();
    };
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const data = await loginUser({
        email,
        password,
      });

      setUser(data.user);

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      return {
        success: false,
        message: getApiErrorMessage(error),
      };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const data = await registerUser(userData);

      setUser(data.user);

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      return {
        success: false,
        message: getApiErrorMessage(error),
      };
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const profile = await getProfile();
      setUser(profile);

      return {
        success: true,
        user: profile,
      };
    } catch (error) {
      return {
        success: false,
        message: getApiErrorMessage(error),
      };
    }
  }, []);

  const updateProfile = useCallback(
    async (profileUpdates) => {
      try {
        const updatedUser = await updateProfileRequest(
          profileUpdates,
        );

        setUser(updatedUser);

        return {
          success: true,
          user: updatedUser,
        };
      } catch (error) {
        return {
          success: false,
          message: getApiErrorMessage(error),
        };
      }
    },
    [],
  );

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      login,
      register,
      logout,
      loadProfile,
      updateProfile,
      refreshUser,
    }),
    [
      user,
      isInitializing,
      login,
      register,
      logout,
      loadProfile,
      updateProfile,
      refreshUser,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth yalnız AuthProvider daxilində istifadə edilə bilər.",
    );
  }

  return context;
}
