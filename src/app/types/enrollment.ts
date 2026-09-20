export type EnrollmentChannel = "EMAIL" | "SMS" | "WHATSAPP";

export type EnrollmentSubscriberType =
  | "RESIDENT"
  | "EMPLOYEE"
  | "FACILITY"
  | "UTILITY_ADMIN"
  | "REGULATOR";

export type EnrollmentStage =
  | "INVITATION"
  | "IDENTITY"
  | "VERIFICATION"
  | "CONSENT"
  | "PREFERENCES"
  | "ACTIVATION"
  | "COMPLETE";

export interface EnrollmentInvitationAcceptResponse {
  session_public_id: string;
  access_token: string;
  status: string;
  current_step: string;
  expires_at?: string | null;
}

export interface EnrollmentSessionResponse {
  session_public_id: string;
  status: string;
  current_step: string;
  expires_at?: string | null;
  subscriber_id?: number | null;
  verified_channels?: EnrollmentChannel[];
}

export interface EnrollmentIdentityRequest {
  full_name: string;
  email: string | null;
  phone: string | null;
  subscriber_type: EnrollmentSubscriberType;
  language: string;
  timezone: string;
  is_emergency_contact: boolean;
}

export interface EnrollmentIdentityResponse {
  subscriber_id: number;
  status: string;
  current_step: string;
}

export interface EnrollmentChallengeRequest {
  channel: EnrollmentChannel;
  destination: string;
  ttl_minutes: number;
  max_attempts: number;
}

export interface EnrollmentChallengeResponse {
  verification_id: number | string;
  channel: EnrollmentChannel;
  destination_hint?: string | null;
  status: string;
  delivery_status: string;
  expires_at?: string | null;
  attempts_remaining?: number | null;
}

export interface EnrollmentVerificationResponse {
  verification_id: number;
  status: string;
  verified_at?: string | null;
  next_step: string;
}

export interface EnrollmentConsentDocument {
  consent_document_id: number;
  title?: string;
  version?: string;
  content: string;
  content_hash: string;
  effective_at?: string | null;
}

export interface EnrollmentConsentResponse {
  consent_id: number;
  decision: "ACCEPTED" | "DECLINED";
  recorded_at?: string;
  next_step: string;
}

export type EnrollmentMinimumSeverity =
  | "LOW"
  | "MODERATE"
  | "HIGH"
  | "CRITICAL";

export interface EnrollmentNotificationPreferenceRequest {
  email_enabled: boolean;
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
  in_app_enabled: boolean;
  push_enabled: boolean;
  minimum_severity: EnrollmentMinimumSeverity;
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string | null;
  quiet_hours_end?: string | null;
  quiet_hours_timezone?: string | null;
  emergency_override_enabled: boolean;
  acknowledgement_required: boolean;
  acknowledgement_timeout_minutes?: number | null;
  escalation_enabled: boolean;
  escalation_timeout_minutes?: number | null;
}

export interface EnrollmentNotificationPreferenceResponse
  extends EnrollmentNotificationPreferenceRequest {
  preference_id: number;
  subscriber_id: number;
  organization_id: number;
  enabled_channels: string[];
  preference_source: string;
  version: number;
}

export interface EnrollmentTopologyResponse {
  assignment_id: number;
  status: string;
  scope_type: string;
  scope_id?: number | null;
  scope_label?: string | null;
  source: string;
  is_synthetic: boolean;
  confidence_score?: number | null;
  created_at?: string | null;
}

export interface EnrollmentActivationStatusResponse {
  status: string;
  current_step: string;
  trust_score?: number | null;
  topology_status?: string | null;
  activated: boolean;
  subscriber_id?: number | null;
  assignment_id?: number | null;
  updated_at?: string | null;
}

export interface EnrollmentWorkspaceSessionResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  subscriber_id: number;
  organization_id: number;
  scopes: string[];
}
