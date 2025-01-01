export interface Profile {
  id: string;
  username: string;
  email: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  socialLinks: {
    spotify?: string;
    soundcloud?: string;
    instagram?: string;
    twitter?: string;
  };
  preferences: {
    visibility: 'public' | 'private' | 'friends';
    emailNotifications: {
      challenges: boolean;
      comments: boolean;
      newsletter: boolean;
    };
  };
}

export interface GameStats {
  totalPlays: number;
  winRate: number;
  bestGenre: string;
  longestStreak: number;
  recentActivity: {
    date: string;
    genre: string;
    score: number;
  }[];
}

export interface FeaturedTrack {
  id: string;
  title: string;
  genre: string;
  plays: number;
  imageUrl: string;
  audioUrl: string;
}