export interface MusicSubmission {
  trackTitle: string;
  artistName: string;
  genre: string;
  audioUrl: string;
  imageUrl?: string;
  isAiGenerated: boolean;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  contactEmail?: string;
  hasRights: boolean;
}

export type Genre = {
  id: string;
  name: string;
};

export const SUPPORTED_AUDIO_FORMATS = ['mp3', 'wav'];
export const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png'];
export const MAX_IMAGE_SIZE_MB = 5;
export const RECOMMENDED_IMAGE_DIMENSIONS = {
  width: 1200,
  height: 1200,
};