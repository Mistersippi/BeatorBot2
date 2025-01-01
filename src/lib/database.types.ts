export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_id: string;
          username: string | null;
          email: string;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
          account_status: 'active' | 'suspended' | 'deleted';
          account_type: 'user' | 'moderator' | 'admin';
          metadata: Record<string, unknown>;
        };
        Insert: {
          auth_id: string;
          username?: string | null;
          email: string;
          avatar_url?: string | null;
          bio?: string | null;
          account_status?: 'active' | 'suspended' | 'deleted';
          account_type?: 'user' | 'moderator' | 'admin';
          metadata?: Record<string, unknown>;
        };
        Update: {
          auth_id?: string;
          username?: string | null;
          email?: string;
          avatar_url?: string | null;
          bio?: string | null;
          account_status?: 'active' | 'suspended' | 'deleted';
          account_type?: 'user' | 'moderator' | 'admin';
          metadata?: Record<string, unknown>;
        };
      };
      submissions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          artist_name: string;
          genre: string;
          subgenre: string;
          description: string | null;
          audio_url: string;
          image_url: string | null;
          is_ai_generated: boolean;
          spotify_url: string | null;
          apple_music_url: string | null;
          artist_website: string | null;
          mood_tags: string[];
          activity_tags: string[];
          time_of_day: string;
          energy_level: string;
          weather_vibe: string;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
          approved_at: string | null;
          metadata: Record<string, unknown>;
        };
      };
    };
  };
}