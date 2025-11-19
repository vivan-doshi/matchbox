import Competition, { ICompetition } from '../models/Competition';
import Team from '../models/Team';
import User from '../models/User';
import mongoose from 'mongoose';

export interface CompetitionFilters {
  status?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CompetitionStats {
  registeredTeams: number;
  totalParticipants: number;
  averageProgress: number;
  submittedTeams: number;
  milestoneAchievementRate: {
    milestoneId: string;
    achievementCount: number;
  }[];
}

class CompetitionService {
  /**
   * Create a new competition
   */
  async createCompetition(
    hostId: mongoose.Types.ObjectId,
    hostName: string,
    competitionData: Partial<ICompetition>
  ): Promise<ICompetition> {
    const competition = await Competition.create({
      ...competitionData,
      hostId,
      hostName,
      status: 'draft',
    });

    // Add competition to user's hostedCompetitions
    await User.findByIdAndUpdate(hostId, {
      $push: { hostedCompetitions: competition._id },
    });

    return competition;
  }

  /**
   * Get competitions with filters and pagination
   */
  async getCompetitions(filters: CompetitionFilters) {
    const {
      status,
      type,
      search,
      page = 1,
      limit = 10,
    } = filters;

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const [competitions, total] = await Promise.all([
      Competition.find(query)
        .sort({ startDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      Competition.countDocuments(query),
    ]);

    return {
      data: competitions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get competition by ID
   */
  async getCompetitionById(
    competitionId: mongoose.Types.ObjectId,
    userId?: mongoose.Types.ObjectId
  ): Promise<ICompetition | null> {
    const competition = await Competition.findById(competitionId);

    if (!competition) {
      return null;
    }

    // If user is the host, include additional details
    if (userId && competition.hostId.toString() === userId.toString()) {
      // Competition data with teams will be added in controller if needed
      return competition;
    }

    return competition;
  }

  /**
   * Update competition (host only)
   */
  async updateCompetition(
    competitionId: mongoose.Types.ObjectId,
    updateData: Partial<ICompetition>
  ): Promise<ICompetition | null> {
    // Prevent updating certain fields
    const allowedUpdates: any = {};

    const allowedFields = [
      'title',
      'description',
      'rules',
      'objectives',
      'evaluationCriteria',
      'prize',
      'endDate',
      'status',
    ];

    for (const field of allowedFields) {
      if (updateData[field as keyof ICompetition] !== undefined) {
        allowedUpdates[field] = updateData[field as keyof ICompetition];
      }
    }

    const competition = await Competition.findByIdAndUpdate(
      competitionId,
      allowedUpdates,
      { new: true, runValidators: true }
    );

    return competition;
  }

  /**
   * Close competition (host only)
   */
  async closeCompetition(
    competitionId: mongoose.Types.ObjectId
  ): Promise<ICompetition | null> {
    const competition = await Competition.findByIdAndUpdate(
      competitionId,
      { status: 'closed' },
      { new: true }
    );

    return competition;
  }

  /**
   * Get competition dashboard statistics (host only)
   */
  async getCompetitionDashboard(
    competitionId: mongoose.Types.ObjectId
  ): Promise<{ competition: ICompetition; stats: CompetitionStats; teams: any[] }> {
    const competition = await Competition.findById(competitionId);

    if (!competition) {
      throw new Error('Competition not found');
    }

    const teams = await Team.find({ competitionId }).populate(
      'members.userId',
      'firstName lastName email profilePicture'
    );

    // Calculate statistics
    const registeredTeams = teams.length;
    const totalParticipants = teams.reduce(
      (sum, team) => sum + team.memberCount,
      0
    );
    const averageProgress =
      teams.length > 0
        ? teams.reduce((sum, team) => sum + team.currentProgress, 0) /
          teams.length
        : 0;
    const submittedTeams = teams.filter((team) => team.status === 'submitted')
      .length;

    // Calculate milestone achievement rates
    const milestoneAchievementRate = competition.milestones.map((milestone) => {
      const achievementCount = teams.filter((team) =>
        team.achievedMilestones.some(
          (am) => am.milestoneId.toString() === milestone._id.toString()
        )
      ).length;

      return {
        milestoneId: milestone._id.toString(),
        achievementCount,
      };
    });

    const stats: CompetitionStats = {
      registeredTeams,
      totalParticipants,
      averageProgress: Math.round(averageProgress),
      submittedTeams,
      milestoneAchievementRate,
    };

    // Update competition analytics
    await Competition.findByIdAndUpdate(competitionId, {
      registeredTeamCount: registeredTeams,
      totalParticipants,
      averageProgress: Math.round(averageProgress),
    });

    return { competition, stats, teams };
  }

  /**
   * Get competition analytics
   */
  async getCompetitionAnalytics(competitionId: mongoose.Types.ObjectId) {
    const teams = await Team.find({ competitionId });

    const totalTeams = teams.length;
    const teamsSubmitted = teams.filter((team) => team.status === 'submitted')
      .length;
    const averageTeamSize =
      totalTeams > 0
        ? teams.reduce((sum, team) => sum + team.memberCount, 0) / totalTeams
        : 0;

    // Progress distribution
    const progressDistribution = {
      '0-25': 0,
      '25-50': 0,
      '50-75': 0,
      '75-100': 0,
    };

    teams.forEach((team) => {
      if (team.currentProgress <= 25) progressDistribution['0-25']++;
      else if (team.currentProgress <= 50) progressDistribution['25-50']++;
      else if (team.currentProgress <= 75) progressDistribution['50-75']++;
      else progressDistribution['75-100']++;
    });

    // Get competition for milestones
    const competition = await Competition.findById(competitionId);
    const timelineAnalytics: any = {};

    if (competition) {
      competition.milestones.forEach((milestone) => {
        const achieved = teams.filter((team) =>
          team.achievedMilestones.some(
            (am) => am.milestoneId.toString() === milestone._id.toString()
          )
        ).length;

        timelineAnalytics[milestone._id.toString()] = {
          achieved,
          inProgress: totalTeams - achieved,
        };
      });
    }

    return {
      totalTeams,
      teamsSubmitted,
      averageTeamSize: Math.round(averageTeamSize * 10) / 10,
      progressDistribution,
      timelineAnalytics,
    };
  }

  /**
   * Get competitions hosted by user
   */
  async getHostedCompetitions(
    hostId: mongoose.Types.ObjectId
  ): Promise<ICompetition[]> {
    return Competition.find({ hostId }).sort({ createdAt: -1 });
  }

  /**
   * Get active competitions
   */
  async getActiveCompetitions(): Promise<ICompetition[]> {
    return (Competition as any).getActiveCompetitions();
  }

  /**
   * Get upcoming competitions
   */
  async getUpcomingCompetitions(): Promise<ICompetition[]> {
    return (Competition as any).getUpcomingCompetitions();
  }
}

export default new CompetitionService();
