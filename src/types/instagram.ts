export interface MediaItem {
  type: 'image' | 'video';
  url: string;
  thumbnailUrl: string;
  width?: number;
  height?: number;
  videoUrl?: string;
}

export interface InstagramPost {
  shortcode: string;
  typename: string;
  caption: string;
  owner: {
    username: string;
    fullName: string;
    profilePicUrl: string;
    isVerified: boolean;
    followersCount?: number;
  };
  mediaItems: MediaItem[];
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
  videoDuration?: number;
  musicInfo?: {
    artistName: string;
    songName: string;
  };
  timestamp?: number;
  productType?: string;
  location?: string | null;
}

export interface DownloadState {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
  data?: InstagramPost;
}

export interface TelegramBotConfig {
  botToken: string;
  webhookUrl: string;
}
