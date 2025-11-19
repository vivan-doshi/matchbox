import mongoose, { Document, Schema } from 'mongoose';

// Team Member sub-schema
export interface ITeamMember {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  role: 'leader' | 'member';
  joinedAt: Date;
  status: 'active' | 'inactive';
  contributionPercentage?: number;
}

const TeamMemberSchema = new Schema<ITeamMember>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['leader', 'member'],
    default: 'member',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  contributionPercentage: {
    type: Number,
    min: 0,
    max: 100,
  },
});

// Progress Update sub-schema
export interface IProgressUpdate {
  timestamp: Date;
  progressPercentage: number;
  comment: string;
  updatedBy: mongoose.Types.ObjectId;
  updatedByName: string;
}

const ProgressUpdateSchema = new Schema<IProgressUpdate>({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  progressPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  comment: {
    type: String,
    required: true,
    maxlength: 500,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedByName: {
    type: String,
    required: true,
  },
});

// Deliverable sub-schema
export interface IDeliverable {
  type: 'file' | 'link' | 'document';
  title: string;
  url: string;
  uploadedAt: Date;
}

const DeliverableSchema = new Schema<IDeliverable>({
  type: {
    type: String,
    enum: ['file', 'link', 'document'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

// Achieved Milestone sub-schema
export interface IAchievedMilestone {
  milestoneId: mongoose.Types.ObjectId;
  achievedAt: Date;
  deliverables: IDeliverable[];
  comment: string;
  verifiedBy?: mongoose.Types.ObjectId;
  verificationFeedback?: string;
}

const AchievedMilestoneSchema = new Schema<IAchievedMilestone>({
  milestoneId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  achievedAt: {
    type: Date,
    default: Date.now,
  },
  deliverables: {
    type: [DeliverableSchema],
    default: [],
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  verificationFeedback: {
    type: String,
    maxlength: 1000,
  },
});

// Final Submission sub-schema
export interface IFinalSubmission {
  submittedAt: Date;
  deliverables: IDeliverable[];
  teamSummary: string;
  contributionBreakdown: {
    userId: mongoose.Types.ObjectId;
    percentage: number;
  }[];
}

const FinalSubmissionSchema = new Schema<IFinalSubmission>({
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  deliverables: {
    type: [DeliverableSchema],
    required: true,
  },
  teamSummary: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  contributionBreakdown: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
    },
  ],
});

// Main Team interface
export interface ITeam extends Document {
  competitionId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  leaderId: mongoose.Types.ObjectId;

  // Members
  members: ITeamMember[];
  maxMembers: number;

  // Status
  status: 'forming' | 'active' | 'submitted' | 'disqualified';
  joinedCompetitionAt: Date;

  // Progress
  currentProgress: number;
  lastProgressUpdate?: Date;
  progressHistory: IProgressUpdate[];

  // Milestones
  achievedMilestones: IAchievedMilestone[];

  // Submissions
  finalSubmission?: IFinalSubmission;

  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    competitionId: {
      type: Schema.Types.ObjectId,
      ref: 'Competition',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a team name'],
      trim: true,
      minlength: [3, 'Team name must be at least 3 characters'],
      maxlength: [100, 'Team name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a team description'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    leaderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: {
      type: [TeamMemberSchema],
      default: [],
      validate: {
        validator: function (members: ITeamMember[]) {
          return members.length > 0;
        },
        message: 'Team must have at least one member',
      },
    },
    maxMembers: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: {
        values: ['forming', 'active', 'submitted', 'disqualified'],
        message: '{VALUE} is not a valid team status',
      },
      default: 'forming',
    },
    joinedCompetitionAt: {
      type: Date,
      default: Date.now,
    },
    currentProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastProgressUpdate: {
      type: Date,
    },
    progressHistory: {
      type: [ProgressUpdateSchema],
      default: [],
    },
    achievedMilestones: {
      type: [AchievedMilestoneSchema],
      default: [],
    },
    finalSubmission: {
      type: FinalSubmissionSchema,
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
TeamSchema.index({ competitionId: 1, status: 1 });
TeamSchema.index({ 'members.userId': 1 });
TeamSchema.index({ leaderId: 1 });
TeamSchema.index({ competitionId: 1, name: 1 }, { unique: true });

// Virtual for member count
TeamSchema.virtual('memberCount').get(function () {
  return this.members.filter((m) => m.status === 'active').length;
});

// Virtual for checking if team is full
TeamSchema.virtual('isFull').get(function () {
  return this.memberCount >= this.maxMembers;
});

// Virtual for checking if team has submitted
TeamSchema.virtual('hasSubmitted').get(function () {
  return this.status === 'submitted' && this.finalSubmission !== undefined;
});

// Static method to get team by user ID
TeamSchema.statics.getTeamsByUser = async function (
  userId: mongoose.Types.ObjectId
) {
  return this.find({
    'members.userId': userId,
    'members.status': 'active',
  }).sort({ createdAt: -1 });
};

// Static method to get teams by competition
TeamSchema.statics.getTeamsByCompetition = async function (
  competitionId: mongoose.Types.ObjectId
) {
  return this.find({ competitionId }).sort({ currentProgress: -1 });
};

// Static method to check if user is already in a team for this competition
TeamSchema.statics.isUserInCompetitionTeam = async function (
  userId: mongoose.Types.ObjectId,
  competitionId: mongoose.Types.ObjectId
) {
  const team = await this.findOne({
    competitionId,
    'members.userId': userId,
    'members.status': 'active',
  });
  return team !== null;
};

// Instance method to add member
TeamSchema.methods.addMember = async function (
  userId: mongoose.Types.ObjectId,
  name: string,
  email: string,
  role: 'leader' | 'member' = 'member'
) {
  if (this.isFull) {
    throw new Error('Team is already full');
  }

  // Check if user already in team
  const existingMember = this.members.find(
    (m) => m.userId.toString() === userId.toString() && m.status === 'active'
  );

  if (existingMember) {
    throw new Error('User is already a member of this team');
  }

  this.members.push({
    userId,
    name,
    email,
    role,
    joinedAt: new Date(),
    status: 'active',
  } as ITeamMember);

  await this.save();
  return this;
};

// Instance method to remove member
TeamSchema.methods.removeMember = async function (
  userId: mongoose.Types.ObjectId
) {
  const memberIndex = this.members.findIndex(
    (m) => m.userId.toString() === userId.toString()
  );

  if (memberIndex === -1) {
    throw new Error('Member not found in team');
  }

  // Don't allow removing the leader if there are other members
  if (
    this.members[memberIndex].role === 'leader' &&
    this.members.filter((m) => m.status === 'active').length > 1
  ) {
    throw new Error('Cannot remove leader while team has other members');
  }

  this.members[memberIndex].status = 'inactive';
  await this.save();
  return this;
};

// Instance method to update progress
TeamSchema.methods.updateProgress = async function (
  progressPercentage: number,
  comment: string,
  updatedBy: mongoose.Types.ObjectId,
  updatedByName: string
) {
  this.currentProgress = progressPercentage;
  this.lastProgressUpdate = new Date();

  this.progressHistory.push({
    timestamp: new Date(),
    progressPercentage,
    comment,
    updatedBy,
    updatedByName,
  } as IProgressUpdate);

  await this.save();
  return this;
};

// Instance method to achieve milestone
TeamSchema.methods.achieveMilestone = async function (
  milestoneId: mongoose.Types.ObjectId,
  comment: string,
  deliverables: IDeliverable[] = []
) {
  // Check if milestone already achieved
  const existing = this.achievedMilestones.find(
    (m) => m.milestoneId.toString() === milestoneId.toString()
  );

  if (existing) {
    throw new Error('Milestone already achieved');
  }

  this.achievedMilestones.push({
    milestoneId,
    achievedAt: new Date(),
    deliverables,
    comment,
  } as IAchievedMilestone);

  await this.save();
  return this;
};

// Instance method to submit final deliverables
TeamSchema.methods.submitFinal = async function (
  deliverables: IDeliverable[],
  teamSummary: string,
  contributionBreakdown: { userId: mongoose.Types.ObjectId; percentage: number }[]
) {
  if (this.finalSubmission) {
    throw new Error('Final submission already exists');
  }

  this.finalSubmission = {
    submittedAt: new Date(),
    deliverables,
    teamSummary,
    contributionBreakdown,
  } as IFinalSubmission;

  this.status = 'submitted';
  await this.save();
  return this;
};

export default mongoose.model<ITeam>('Team', TeamSchema);
