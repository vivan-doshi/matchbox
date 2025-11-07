import React, { createContext, useContext, useState } from 'react';

type SignupFormData = {
  // Step 1: Email
  email: string;
  password: string;

  // Step 2: Profile
  firstName: string;
  lastName: string;
  preferredName?: string;
  profilePicture?: File;

  // Step 3: Links
  linkedin?: string;
  github?: string;
  portfolio?: string;
  resume?: File;

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

export const SignupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<Partial<SignupFormData>>({
    skills: [],
    interests: [],
    weeklyAvailability: {
      hoursPerWeek: 0,
    },
    isAlumni: false,
  });

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
