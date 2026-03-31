// =============================================================================
// Enum types (mirrors PostgreSQL enums)
// =============================================================================

export type OpportunityCategory =
  | 'internship'
  | 'volunteer'
  | 'scholarship'
  | 'summer_program'
  | 'competition'
  | 'leadership'
  | 'job'
  | 'mentorship'
  | 'other';

export type RemoteType = 'in_person' | 'remote' | 'hybrid';

export type PaidType = 'paid' | 'unpaid' | 'stipend' | 'varies';

export type DeadlineType = 'fixed' | 'rolling' | 'none';

export type ApplicationStatus = 'open' | 'closing_soon' | 'rolling' | 'closed' | 'unknown';

export type VerificationStatus =
  | 'verified'
  | 'pending'
  | 'needs_review'
  | 'failed'
  | 'unverified';

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'needs_edits';

export type SourceType = 'official' | 'community' | 'scraped' | 'manual' | 'csv_import';

// =============================================================================
// Row types (select)
// =============================================================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  description: string | null;
  logo_url: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  slug: string;
  title: string;
  organization_id: string | null;
  category: OpportunityCategory;
  short_summary: string | null;
  full_description: string | null;
  eligibility: string | null;
  grades_min: number | null;
  grades_max: number | null;
  age_min: number | null;
  age_max: number | null;
  location_city: string | null;
  location_county: string | null;
  remote_type: RemoteType;
  paid_type: PaidType;
  compensation_text: string | null;
  cost_text: string | null;
  is_free: boolean;
  deadline_type: DeadlineType;
  deadline_at: string | null;
  application_status: ApplicationStatus;
  official_application_url: string | null;
  source_url: string | null;
  source_name: string | null;
  source_type: SourceType;
  verified: boolean;
  verification_status: VerificationStatus;
  last_verified_at: string | null;
  featured: boolean;
  is_active: boolean;
  time_commitment: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  organization_name: string;
  contact_name: string | null;
  contact_email: string;
  opportunity_title: string;
  category: OpportunityCategory;
  short_summary: string | null;
  full_description: string | null;
  eligibility: string | null;
  grades_min: number | null;
  grades_max: number | null;
  age_min: number | null;
  age_max: number | null;
  location_city: string | null;
  remote_type: RemoteType;
  paid_type: PaidType;
  compensation_text: string | null;
  cost_text: string | null;
  is_free: boolean;
  deadline_at: string | null;
  official_application_url: string | null;
  supporting_url: string | null;
  logo_url: string | null;
  verification_notes: string | null;
  status: SubmissionStatus;
  admin_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface VerificationLog {
  id: string;
  opportunity_id: string;
  checked_at: string;
  source_url_status: number | null;
  application_url_status: number | null;
  source_url_ok: boolean;
  application_url_ok: boolean;
  notes: string | null;
  auto_check: boolean;
}

export interface DigestSubscriber {
  id: string;
  email: string;
  name: string | null;
  interests: string[];
  is_active: boolean;
  confirmed: boolean;
  created_at: string;
  unsubscribed_at: string | null;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  created_at: string;
}

export interface SavedOpportunity {
  id: string;
  user_email: string;
  opportunity_id: string;
  created_at: string;
}

// =============================================================================
// Insert types (for creating new records - omit generated fields)
// =============================================================================

export type OrganizationInsert = Omit<Organization, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type OpportunityInsert = Omit<Opportunity, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type SubmissionInsert = Omit<
  Submission,
  'id' | 'status' | 'admin_notes' | 'reviewed_at' | 'reviewed_by' | 'created_at' | 'updated_at'
> & {
  id?: string;
  status?: SubmissionStatus;
  admin_notes?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type VerificationLogInsert = Omit<VerificationLog, 'id' | 'checked_at'> & {
  id?: string;
  checked_at?: string;
};

export type DigestSubscriberInsert = Omit<
  DigestSubscriber,
  'id' | 'is_active' | 'confirmed' | 'created_at' | 'unsubscribed_at'
> & {
  id?: string;
  is_active?: boolean;
  confirmed?: boolean;
  created_at?: string;
  unsubscribed_at?: string | null;
};

export type AdminUserInsert = Omit<AdminUser, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type SavedOpportunityInsert = Omit<SavedOpportunity, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

// =============================================================================
// Update types (all fields optional)
// =============================================================================

export type OrganizationUpdate = Partial<Omit<Organization, 'id' | 'created_at'>>;
export type OpportunityUpdate = Partial<Omit<Opportunity, 'id' | 'created_at'>>;
export type SubmissionUpdate = Partial<Omit<Submission, 'id' | 'created_at'>>;
export type VerificationLogUpdate = Partial<Omit<VerificationLog, 'id'>>;
export type DigestSubscriberUpdate = Partial<Omit<DigestSubscriber, 'id' | 'created_at'>>;
export type AdminUserUpdate = Partial<Omit<AdminUser, 'id' | 'created_at'>>;
export type SavedOpportunityUpdate = Partial<Omit<SavedOpportunity, 'id' | 'created_at'>>;

// =============================================================================
// Joined / enriched types used in the UI
// =============================================================================

export interface OpportunityWithOrganization extends Opportunity {
  organization: Organization | null;
}

// =============================================================================
// Database type grouping
// =============================================================================

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: OrganizationInsert;
        Update: OrganizationUpdate;
      };
      opportunities: {
        Row: Opportunity;
        Insert: OpportunityInsert;
        Update: OpportunityUpdate;
      };
      submissions: {
        Row: Submission;
        Insert: SubmissionInsert;
        Update: SubmissionUpdate;
      };
      verification_logs: {
        Row: VerificationLog;
        Insert: VerificationLogInsert;
        Update: VerificationLogUpdate;
      };
      digest_subscribers: {
        Row: DigestSubscriber;
        Insert: DigestSubscriberInsert;
        Update: DigestSubscriberUpdate;
      };
      admin_users: {
        Row: AdminUser;
        Insert: AdminUserInsert;
        Update: AdminUserUpdate;
      };
      saved_opportunities: {
        Row: SavedOpportunity;
        Insert: SavedOpportunityInsert;
        Update: SavedOpportunityUpdate;
      };
    };
    Enums: {
      opportunity_category: OpportunityCategory;
      remote_type: RemoteType;
      paid_type: PaidType;
      deadline_type: DeadlineType;
      application_status: ApplicationStatus;
      verification_status: VerificationStatus;
      submission_status: SubmissionStatus;
      source_type: SourceType;
    };
  };
}
