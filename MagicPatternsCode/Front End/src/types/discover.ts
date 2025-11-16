export interface DiscoverUserSkill {
  name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Fluent' | 'Expert';
}

export interface DiscoverUser {
  id: string;
  rawId?: string;
  _id?: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  title: string;
  school: string;
  major: string;
  graduationYear: string;
  skills: DiscoverUserSkill[];
  interests: string[];
  availability: {
    totalHours: number;
  };
  bio: string;
  linkedin?: string;
  github?: string;
  resume?: {
    url: string;
    filename: string;
  };
}
