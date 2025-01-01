export interface Track {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  audioUrl: string;
  duration: number;
  isAI: boolean;
}

export interface GameState {
  currentTrack: number;
  score: number;
  totalTracks: number;
  answers: boolean[];
}

export interface ProgressStats {
  correct: number;
  total: number;
  percentage: number;
}