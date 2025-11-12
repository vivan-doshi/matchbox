import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'matchbox_signup_data';

type SignupFormData = {
  // Step 1: Email
  email: string;
  password: string;

  // Step 2: Profile
  firstName: string;
  lastName: string;
  preferredName?: string;
  profilePicture?: string; // data URL

  // Step 3: Links
  linkedin?: string;
  github?: string;
  portfolio?: string;
  resume?: {
    dataUrl: string;
    filename: string;
    mimeType: string;
  };

  // Step 4: Bio & Skills
  bio?: string;
  skills?: Array<{
    name: string;
    proficiency: 'Beginner' | 'Intermediate' | 'Fluent' | 'Expert';
  }>;
  interests?: string[];
  weeklyAvailability?: {
    hoursPerWeek: number;
  };

  // Step 5: Education
  university: string;
  major: string;
  graduationYear?: number;
  isAlumni: boolean;
};

type SignupContextType = {
  formData: Partial<SignupFormData>;
  updateFormData: (data: Partial<SignupFormData>) => void;
  resetFormData: () => void;
};

const SignupContext = createContext<SignupContextType | undefined>(undefined);

// Load initial data from sessionStorage
const loadFromStorage = (): Partial<SignupFormData> => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('[SignupContext] Loaded data from sessionStorage:', parsed);
      return parsed;
    }
  } catch (error) {
    console.error('[SignupContext] Error loading from sessionStorage:', error);
  }

  return {
    skills: [],
    interests: [],
    weeklyAvailability: {
      hoursPerWeek: 0,
    },
    isAlumni: false,
  };
};

export const SignupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<Partial<SignupFormData>>(loadFromStorage);

  // Save to sessionStorage whenever formData changes (excluding File objects)
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      console.log('[SignupContext] Saved data to sessionStorage:', formData);
    } catch (error) {
      console.error('[SignupContext] Error saving to sessionStorage:', error);
    }
  }, [formData]);

  const updateFormData = (data: Partial<SignupFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const resetFormData = () => {
    setFormData({
      skills: [],
      interests: [],
      weeklyAvailability: {
        hoursPerWeek: 0,
      },
      isAlumni: false,
    });
    // Clear sessionStorage on reset
    sessionStorage.removeItem(STORAGE_KEY);
    console.log('[SignupContext] Cleared sessionStorage');
  };

  return (
    <SignupContext.Provider value={{ formData, updateFormData, resetFormData }}>
      {children}
    </SignupContext.Provider>
  );
};

export const useSignupContext = () => {
  const context = useContext(SignupContext);
  if (!context) {
    throw new Error('useSignupContext must be used within SignupProvider');
  }
  return context;
};
