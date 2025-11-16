import { ProfilePicture, UserResume } from '../types/api';

/**
 * Get profile picture URL from either old (string) or new (object) format
 */
export const getProfilePictureUrl = (
  profilePicture?: ProfilePicture | string
): string => {
  if (!profilePicture) {
    return 'https://api.dicebear.com/7.x/avataaars/svg';
  }

  if (typeof profilePicture === 'string') {
    return profilePicture;
  }

  return profilePicture.url || 'https://api.dicebear.com/7.x/avataaars/svg';
};

/**
 * Get resume URL from either old (dataUrl) or new (url) format
 */
export const getResumeUrl = (resume?: UserResume): string | null => {
  if (!resume) return null;

  // Prefer new format (url) over old format (dataUrl)
  return resume.url || resume.dataUrl || null;
};

/**
 * Get resume filename
 */
export const getResumeFilename = (resume?: UserResume): string | null => {
  if (!resume) return null;
  return resume.filename || 'resume.pdf';
};
