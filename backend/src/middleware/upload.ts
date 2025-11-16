import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';
import { Request } from 'express';

// Custom file filter for profile pictures (images only)
const profilePictureFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for profile pictures'));
  }
};

// Custom file filter for resumes (PDFs and docs)
const resumeFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed for resumes'));
  }
};

// Cloudinary storage for profile pictures
const profilePictureStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'matchbox/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit', quality: 'auto' }],
  } as any,
});

// Cloudinary storage for resumes
const resumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'matchbox/resumes',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'raw', // Important for non-image files
  } as any,
});

// Multer upload instance for profile pictures
export const uploadProfilePicture = multer({
  storage: profilePictureStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: profilePictureFilter,
});

// Multer upload instance for resumes
export const uploadResume = multer({
  storage: resumeStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: resumeFilter,
});

// Combined upload for both fields
export const uploadUserFiles = multer({
  storage: multer.memoryStorage(), // We'll handle storage manually for mixed uploads
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === 'profilePicture') {
      profilePictureFilter(_req, file, cb);
    } else if (file.fieldname === 'resume') {
      resumeFilter(_req, file, cb);
    } else {
      cb(null, true);
    }
  },
}).fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
]);
