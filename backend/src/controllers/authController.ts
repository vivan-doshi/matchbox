import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/generateToken';
import { AuthRequest } from '../middleware/auth';
import { uploadProfilePicture, uploadResumeFile } from '../utils/fileUpload';
import { sendVerificationEmail } from '../utils/emailService';
import { v4 as uuidv4 } from 'uuid';

// @desc    Check if email exists
// @route   POST /api/auth/check-email
// @access  Public
export const checkEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required',
      });
      return;
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });

    res.status(200).json({
      success: true,
      exists: !!userExists,
      message: userExists ? 'Email is already in use' : 'Email is available',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      preferredName,
      university,
      major,
      graduationYear,
      isAlumni,
      bio,
      skills,
      professionalLinks,
      interests,
      weeklyAvailability,
    } = req.body;

    // Parse JSON strings from FormData
    const parsedSkills = skills ? JSON.parse(skills) : [];
    const parsedProfessionalLinks = professionalLinks ? JSON.parse(professionalLinks) : {};
    const parsedInterests = interests ? JSON.parse(interests) : [];
    const parsedWeeklyAvailability = weeklyAvailability ? JSON.parse(weeklyAvailability) : { hoursPerWeek: 0 };

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
      return;
    }

    // Handle file uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let profilePictureData = undefined;
    let resumeData = undefined;

    // Upload profile picture if provided
    if (files && files.profilePicture && files.profilePicture[0]) {
      const profilePictureFile = files.profilePicture[0];
      const uploaded = await uploadProfilePicture(profilePictureFile.buffer);
      profilePictureData = {
        url: uploaded.url,
        publicId: uploaded.publicId,
      };
    }

    // Upload resume if provided
    if (files && files.resume && files.resume[0]) {
      const resumeFile = files.resume[0];
      const uploaded = await uploadResumeFile(resumeFile.buffer, resumeFile.originalname);
      resumeData = {
        filename: resumeFile.originalname,
        url: uploaded.url,
        publicId: uploaded.publicId,
        uploadedAt: new Date(),
      };
    }

    // Generate email verification token
    const verificationToken = uuidv4();
    const verificationExpires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      preferredName,
      university,
      major,
      graduationYear,
      isAlumni,
      bio,
      skills: parsedSkills,
      professionalLinks: parsedProfessionalLinks,
      profilePicture: profilePictureData,
      resume: resumeData,
      interests: parsedInterests,
      weeklyAvailability: parsedWeeklyAvailability,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      emailVerified: false,
      uscIdVerified: false, // Will be set to true after email verification
    });

    // Send verification email
    try {
      const userName = user.preferredName || user.firstName;
      await sendVerificationEmail(user.email, verificationToken, userName);
    } catch (emailError: any) {
      console.error('Error sending verification email:', emailError);
      // Continue with signup even if email fails
    }

    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        preferredName: user.preferredName,
        university: user.university,
        major: user.major,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide an email and password',
      });
      return;
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        preferredName: user.preferredName,
        university: user.university,
        major: user.major,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Verify email with token
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    // Find user with matching token and not expired
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
      return;
    }

    // Check if already verified
    if (user.emailVerified) {
      res.status(200).json({
        success: true,
        message: 'Email already verified',
      });
      return;
    }

    // Update user - mark as verified
    user.emailVerified = true;
    user.uscIdVerified = true; // Auto-verify USC affiliation since email is @usc.edu
    user.uscIdVerifiedAt = new Date();
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now access all features including competitions.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required',
      });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'No account found with this email',
      });
      return;
    }

    // Check if already verified
    if (user.emailVerified) {
      res.status(200).json({
        success: true,
        message: 'Email is already verified',
      });
      return;
    }

    // Generate new verification token
    const verificationToken = uuidv4();
    const verificationExpires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send verification email
    const userName = user.preferredName || user.firstName;
    await sendVerificationEmail(user.email, verificationToken, userName);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully. Please check your inbox.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send verification email',
    });
  }
};
