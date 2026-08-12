import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  currentUser: "career_platform_current_user",
  users: "career_platform_users",
};

const demoUser = {
  id: "demo-user",
  name: "Demo İstifadəçi",
  email: "demo@karyerayol.az",
  password: "demo123",
  education: "Holberton School",
  location: "Bakı",
  interests: ["Texnologiya", "Dizayn"],
  skills: ["HTML", "CSS", "JavaScript"],
  bio: "Yeni bacarıqlar öyrənərək texnologiya sahəsində karyera qurmaq istəyirəm.",
};

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function createUserId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `user-${Date.now()}`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    readStorage(STORAGE_KEYS.currentUser, null),
  );

  useEffect(() => {
    const existingUsers = readStorage(STORAGE_KEYS.users, []);
    const demoUserExists = existingUsers.some(
      (savedUser) => savedUser.email === demoUser.email,
    );

    if (!demoUserExists) {
      localStorage.setItem(
        STORAGE_KEYS.users,
        JSON.stringify([...existingUsers, demoUser]),
      );
    }
  }, []);

  function login(email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    const users = readStorage(STORAGE_KEYS.users, []);

    const matchingUser = users.find(
      (savedUser) =>
        savedUser.email.toLowerCase() === normalizedEmail &&
        savedUser.password === password,
    );

    if (!matchingUser) {
      return {
        success: false,
        message: "E-poçt ünvanı və ya şifrə yanlışdır.",
      };
    }

    const { password: _password, ...safeUser } = matchingUser;

    localStorage.setItem(
      STORAGE_KEYS.currentUser,
      JSON.stringify(safeUser),
    );
    setUser(safeUser);

    return {
      success: true,
      user: safeUser,
    };
  }

  function register({ name, email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const users = readStorage(STORAGE_KEYS.users, []);

    const userExists = users.some(
      (savedUser) =>
        savedUser.email.toLowerCase() === normalizedEmail,
    );

    if (userExists) {
      return {
        success: false,
        message: "Bu e-poçt ünvanı ilə artıq hesab yaradılıb.",
      };
    }

    const newUser = {
      id: createUserId(),
      name: name.trim(),
      email: normalizedEmail,
      password,
      education: "",
      location: "",
      interests: [],
      skills: [],
      bio: "",
    };

    const { password: _password, ...safeUser } = newUser;

    localStorage.setItem(
      STORAGE_KEYS.users,
      JSON.stringify([...users, newUser]),
    );
    localStorage.setItem(
      STORAGE_KEYS.currentUser,
      JSON.stringify(safeUser),
    );

    setUser(safeUser);

    return {
      success: true,
      user: safeUser,
    };
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    setUser(null);
  }

  function updateProfile(profileUpdates) {
    if (!user) {
      return {
        success: false,
        message: "Profil yeniləmək üçün giriş etməlisiniz.",
      };
    }

    const users = readStorage(STORAGE_KEYS.users, []);

    const updatedSafeUser = {
      ...user,
      ...profileUpdates,
      id: user.id,
      email: user.email,
    };

    const updatedUsers = users.map((savedUser) =>
      savedUser.id === user.id
        ? {
            ...savedUser,
            ...profileUpdates,
            id: savedUser.id,
            email: savedUser.email,
          }
        : savedUser,
    );

    localStorage.setItem(
      STORAGE_KEYS.users,
      JSON.stringify(updatedUsers),
    );
    localStorage.setItem(
      STORAGE_KEYS.currentUser,
      JSON.stringify(updatedSafeUser),
    );

    setUser(updatedSafeUser);

    return {
      success: true,
      user: updatedSafeUser,
    };
  }

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      updateProfile,
    }),
    [user],
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
      "useAuth funksiyası yalnız AuthProvider daxilində istifadə edilə bilər.",
    );
  }

  return context;
}