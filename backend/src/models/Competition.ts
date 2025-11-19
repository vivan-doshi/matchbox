import mongoose, { Document, Schema } from 'mongoose';

// Milestone sub-schema
export interface IMilestone {
  _id: mongoose.Types.ObjectId;
  order: number;
  title: string;
  description: string;
  dueDate: Date;
  weight?: number;
  isRequired: boolean;
}

const MilestoneSchema = new Schema<IMilestone>({
  order: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  weight: {
    type: Number,
    min: 0,
    max: 100,
  },
  isRequired: {
    type: Boolean,
    default: false,
  },
});

// Main Competition interface
export interface ICompetition extends Document {
  title: string;
  description: string;
  type: 'hackathon' | 'case-competition' | 'group-project';
  hostId: mongoose.Types.ObjectId;
  hostName: string;

  // Timeline
  startDate: Date;
  endDate: Date;

  // Constraints
  maxTeamSize: number;
  minTeamSize: number;
  maxTeams?: number;

  // Content
  rules: string;
  objectives: string;
  evaluationCriteria?: string;
  prize?: string;

  // Milestones
  milestones: IMilestone[];

  // Status
  status: 'draft' | 'open' | 'in-progress' | 'closed' | 'archived';

  // Settings
  requiresHostApproval: boolean;
  allowSelfTeams: boolean;

  // Analytics (denormalized for performance)
  registeredTeamCount: number;
  totalParticipants: number;
  averageProgress: number;

  createdAt: Date;
  updatedAt: Date;
}

const CompetitionSchema = new Schema<ICompetition>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a competition title'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    type: {
      type: String,
      enum: {
        values: ['hackathon', 'case-competition', 'group-project'],
        message: '{VALUE} is not a valid competition type',
      },
      required: [true, 'Please specify a competition type'],
    },
    hostId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hostName: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide a start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide an end date'],
      validate: {
        validator: function (this: ICompetition, value: Date) {
          return value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    maxTeamSize: {
      type: Number,
      required: [true, 'Please specify maximum team size'],
      min: [1, 'Maximum team size must be at least 1'],
      max: [20, 'Maximum team size cannot exceed 20'],
    },
    minTeamSize: {
      type: Number,
      required: [true, 'Please specify minimum team size'],
      min: [1, 'Minimum team size must be at least 1'],
      validate: {
        validator: function (this: ICompetition, value: number) {
          return value <= this.maxTeamSize;
        },
        message: 'Minimum team size must be less than or equal to maximum team size',
      },
    },
    maxTeams: {
      type: Number,
      min: [1, 'Maximum teams must be at least 1'],
    },
    rules: {
      type: String,
      required: [true, 'Please provide competition rules'],
      maxlength: [5000, 'Rules cannot exceed 5000 characters'],
    },
    objectives: {
      type: String,
      required: [true, 'Please provide competition objectives'],
      maxlength: [5000, 'Objectives cannot exceed 5000 characters'],
    },
    evaluationCriteria: {
      type: String,
      maxlength: [5000, 'Evaluation criteria cannot exceed 5000 characters'],
    },
    prize: {
      type: String,
      maxlength: [500, 'Prize description cannot exceed 500 characters'],
    },
    milestones: {
      type: [MilestoneSchema],
      default: [],
      validate: {
        validator: function (milestones: IMilestone[]) {
          return milestones.length > 0;
        },
        message: 'Competition must have at least one milestone',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'open', 'in-progress', 'closed', 'archived'],
        message: '{VALUE} is not a valid status',
      },
      default: 'draft',
    },
    requiresHostApproval: {
      type: Boolean,
      default: false,
    },
    allowSelfTeams: {
      type: Boolean,
      default: true,
    },
    registeredTeamCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalParticipants: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
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
        return ret;
      },
    },
  }
);

// Indexes for query optimization
CompetitionSchema.index({ hostId: 1, status: 1 });
CompetitionSchema.index({ startDate: 1, endDate: 1 });
CompetitionSchema.index({ type: 1, status: 1 });
CompetitionSchema.index({ status: 1, startDate: -1 });

// Text search index
CompetitionSchema.index({
  title: 'text',
  description: 'text',
  objectives: 'text',
});

// Virtual for checking if competition is active
CompetitionSchema.virtual('isActive').get(function () {
  const now = new Date();
  return (
    this.status === 'open' || this.status === 'in-progress'
  ) && this.startDate <= now && this.endDate >= now;
});

// Virtual for checking if registration is open
CompetitionSchema.virtual('isRegistrationOpen').get(function () {
  const now = new Date();
  return this.status === 'open' && this.startDate > now;
});

// Virtual for checking if competition has started
CompetitionSchema.virtual('hasStarted').get(function () {
  return new Date() >= this.startDate;
});

// Virtual for checking if competition has ended
CompetitionSchema.virtual('hasEnded').get(function () {
  return new Date() > this.endDate;
});

// Pre-save middleware to update status based on dates
CompetitionSchema.pre('save', function (next) {
  const now = new Date();

  // Auto-update status based on dates if not manually set to closed/archived
  if (this.status !== 'closed' && this.status !== 'archived') {
    if (now >= this.startDate && now <= this.endDate) {
      if (this.status === 'open') {
        this.status = 'in-progress';
      }
    }
  }

  next();
});

// Static method to get active competitions
CompetitionSchema.statics.getActiveCompetitions = async function () {
  const now = new Date();
  return this.find({
    status: { $in: ['open', 'in-progress'] },
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).sort({ startDate: -1 });
};

// Static method to get upcoming competitions
CompetitionSchema.statics.getUpcomingCompetitions = async function () {
  const now = new Date();
  return this.find({
    status: 'open',
    startDate: { $gt: now },
  }).sort({ startDate: 1 });
};

// Static method to get competitions by host
CompetitionSchema.statics.getCompetitionsByHost = async function (
  hostId: mongoose.Types.ObjectId
) {
  return this.find({ hostId }).sort({ createdAt: -1 });
};

export default mongoose.model<ICompetition>('Competition', CompetitionSchema);
