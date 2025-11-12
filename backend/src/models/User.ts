import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  university: string;
  major: string;
  graduationYear?: number;
  isAlumni: boolean;
  bio?: string;
  profilePicture?: string;
  resume?: {
    filename?: string;
    dataUrl?: string;
    uploadedAt?: Date;
  };
  skills: Array<{
    name: string;
    proficiency: 'Beginner' | 'Intermediate' | 'Fluent' | 'Expert';
  }>;
  professionalLinks: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  interests: string[];
  savedProjects?: Types.ObjectId[];
  weeklyAvailability?: {
    hoursPerWeek: number;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/\.edu$/, 'Email must be from an educational institution (.edu)'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
    },
    preferredName: {
      type: String,
    },
    university: {
      type: String,
      required: [true, 'University is required'],
    },
    major: {
      type: String,
      required: [true, 'Major is required'],
    },
    graduationYear: {
      type: Number,
    },
    isAlumni: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    profilePicture: {
      type: String,
      default: 'https://api.dicebear.com/7.x/avataaars/svg',
    },
    resume: {
      filename: String,
      dataUrl: String,
      uploadedAt: Date,
    },
    skills: [
      {
        name: { type: String, required: true },
        proficiency: {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Fluent', 'Expert'],
          required: true,
        },
      },
    ],
    professionalLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
    },
    interests: [String],
    savedProjects: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Project',
        },
      ],
      default: [],
    },
    weeklyAvailability: {
      hoursPerWeek: { type: Number, min: 0, max: 168, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password; // Don't send password in JSON responses
        return ret;
      },
    },
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
