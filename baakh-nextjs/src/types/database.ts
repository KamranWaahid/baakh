export interface Database {
  public: {
    Tables: {
      sticky_notes: {
        Row: {
          id: string;
          title: string | null;
          body: string;
          source_url: string | null;
          source_author: string | null;
          language: string;
          status: 'inbox' | 'review' | 'approved' | 'archived';
          priority: number | null;
          created_at: string;
          updated_at: string;
          created_by: string;
          updated_by: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          title?: string | null;
          body: string;
          source_url?: string | null;
          source_author?: string | null;
          language?: string;
          status?: 'inbox' | 'review' | 'approved' | 'archived';
          priority?: number | null;
          created_at?: string;
          updated_at?: string;
          created_by: string;
          updated_by: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string | null;
          body?: string;
          source_url?: string | null;
          source_author?: string | null;
          language?: string;
          status?: 'inbox' | 'review' | 'approved' | 'archived';
          priority?: number | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
          updated_by?: string;
          deleted_at?: string | null;
        };
      };
      tags: {
        Row: {
          id: string;
          slug: string;
          label: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          label: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          label?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      note_tags: {
        Row: {
          id: string;
          note_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          note_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          note_id?: string;
          tag_id?: string;
          created_at?: string;
        };
      };
      poets: {
        Row: {
          id: string;
          name: string;
          sindhi_name: string | null;
          english_name: string | null;
          sindhi_laqab: string | null;
          english_laqab: string | null;
          sindhi_takhalus: string | null;
          english_takhalus: string | null;
          period: string;
          location: string | null;
          location_sd: string | null;
          location_en: string | null;
          avatar: string | null;
          photo: string | null;
          description: string | null;
          long_description: string | null;
          birth_date: string | null;
          death_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sindhi_name?: string | null;
          english_name?: string | null;
          sindhi_laqab?: string | null;
          english_laqab?: string | null;
          sindhi_takhalus?: string | null;
          english_takhalus?: string | null;
          period: string;
          location?: string | null;
          location_sd?: string | null;
          location_en?: string | null;
          avatar?: string | null;
          photo?: string | null;
          description?: string | null;
          long_description?: string | null;
          birth_date?: string | null;
          death_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sindhi_name?: string | null;
          english_name?: string | null;
          sindhi_laqab?: string | null;
          english_laqab?: string | null;
          sindhi_takhalus?: string | null;
          english_takhalus?: string | null;
          period?: string;
          location?: string | null;
          location_sd?: string | null;
          location_en?: string | null;
          avatar?: string | null;
          photo?: string | null;
          description?: string | null;
          long_description?: string | null;
          birth_date?: string | null;
          death_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          information: string | null;
          detail_align: string;
          languages: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          information?: string | null;
          detail_align?: string;
          languages?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          information?: string | null;
          detail_align?: string;
          languages?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      couplets: {
        Row: {
          id: string;
          couplet_text: string;
          couplet_slug: string;
          lang: string;
          poet_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          couplet_text: string;
          couplet_slug: string;
          lang: string;
          poet_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          couplet_text?: string;
          couplet_slug?: string;
          lang?: string;
          poet_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Specific type exports for common use cases
export type StickyNote = Tables<'sticky_notes'>;
export type Tag = Tables<'tags'>;
export type NoteTag = Tables<'note_tags'>;
export type Poet = Tables<'poets'>;
export type Category = Tables<'categories'>;
export type Couplet = Tables<'couplets'>;

export type StickyNoteInsert = Inserts<'sticky_notes'>;
export type TagInsert = Inserts<'tags'>;
export type NoteTagInsert = Inserts<'note_tags'>;
export type PoetInsert = Inserts<'poets'>;
export type CategoryInsert = Inserts<'categories'>;
export type CoupletInsert = Inserts<'couplets'>;

export type StickyNoteUpdate = Updates<'sticky_notes'>;
export type TagUpdate = Updates<'tags'>;
export type NoteTagUpdate = Updates<'note_tags'>;
export type PoetUpdate = Updates<'poets'>;
export type CategoryUpdate = Updates<'categories'>;
export type CoupletUpdate = Updates<'couplets'>;
