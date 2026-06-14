export type UserRole = 'tenant' | 'landlord' | 'admin';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type OnboardingDocumentType =
  | 'cnic_front'
  | 'cnic_back'
  | 'character_certificate'
  | 'profile_photo'
  | 'property_reference_photo';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  is_verified: boolean;
  created_at: string;
}

export type PropertyType = 'room' | 'apartment' | 'house' | 'studio' | 'hostel';
export type ListingStatus = 'pending' | 'active' | 'rented' | 'paused' | 'rejected' | 'deleted';

export interface Listing {
  id: string;
  landlord_id: string;
  title: string;
  description: string | null;
  property_type: PropertyType;
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  monthly_rent: number;
  deposit: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  amenities: string[] | null;
  house_rules: string | null;
  availability_date: string | null;
  status: ListingStatus;
  rejection_reason: string | null;
  views_count: number;
  created_at: string;
  updated_at: string;
  landlord?: Profile;
  images?: ListingImage[];
}

export interface ListingImage {
  id: string;
  listing_id: string;
  storage_path: string;
  display_order: number;
  created_at: string;
}

export interface Review {
  id: string;
  listing_id: string;
  tenant_id: string;
  rating: number;
  comment: string | null;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
  tenant?: Profile;
  listing?: Listing;
}

export interface Inquiry {
  id: string;
  listing_id: string;
  tenant_id: string;
  message: string;
  is_read: boolean;
  landlord_reply: string | null;
  replied_at: string | null;
  created_at: string;
  listing?: Listing;
  tenant?: Profile;
}

export interface SavedListing {
  id: string;
  tenant_id: string;
  listing_id: string;
  created_at: string;
  listing?: Listing;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  notes: string | null;
  created_at: string;
  admin?: Profile;
}

export interface TenantOnboarding {
  user_id: string;
  full_name: string;
  phone: string;
  occupation: string;
  monthly_income: number;
  reason_for_using: string;
  preferred_city: string;
  preferred_property_types: PropertyType[];
  budget_min: number;
  budget_max: number;
  household_size: number;
  move_in_date: string | null;
  cnic_number: string | null;
  verification_status: VerificationStatus;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface LandlordOnboarding {
  user_id: string;
  full_name: string;
  phone: string;
  occupation: string;
  monthly_income: number;
  reason_for_using: string;
  ownership_status: string;
  listing_intent: string;
  property_city: string;
  expected_listings_count: number;
  cnic_number: string | null;
  verification_status: VerificationStatus;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface OnboardingDocument {
  id: string;
  user_id: string;
  role: Exclude<UserRole, 'admin'>;
  document_type: OnboardingDocumentType;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  review_status: VerificationStatus;
  created_at: string;
}
