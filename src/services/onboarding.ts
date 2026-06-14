import { supabase } from "./supabase";
import type {
  LandlordOnboarding,
  OnboardingDocument,
  OnboardingDocumentType,
  TenantOnboarding,
  UserRole,
  VerificationStatus,
} from "../types";

type OnboardingRole = Exclude<UserRole, "admin">;

export type TenantOnboardingInput = Omit<
  TenantOnboarding,
  "user_id" | "verification_status" | "completed" | "created_at" | "updated_at"
>;

export type LandlordOnboardingInput = Omit<
  LandlordOnboarding,
  "user_id" | "verification_status" | "completed" | "created_at" | "updated_at"
>;

export const onboardingService = {
  async isComplete(userId: string, role: UserRole) {
    if (role === "admin") return true;

    const table =
      role === "tenant" ? "tenant_onboarding" : "landlord_onboarding";
    const { data, error } = await supabase
      .from(table)
      .select("completed")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.warn("Onboarding status unavailable:", error.message);
      return false;
    }

    return !!data?.completed;
  },

  async getPendingOnboardings() {
    const [tenants, landlords] = await Promise.all([
      supabase
        .from("tenant_onboarding")
        .select("*")
        .eq("verification_status", "pending")
        .eq("completed", true),
      supabase
        .from("landlord_onboarding")
        .select("*")
        .eq("verification_status", "pending")
        .eq("completed", true),
    ]);

    if (tenants.error) {
      console.error("Error fetching tenant onboarding:", tenants.error);
    }
    if (landlords.error) {
      console.error("Error fetching landlord onboarding:", landlords.error);
    }

    // Fetch profiles and documents separately for these users
    const allUserIds = [
      ...(tenants.data || []).map((t: any) => t.user_id),
      ...(landlords.data || []).map((l: any) => l.user_id),
    ];

    console.log("Pending onboarding user IDs:", allUserIds);

    let profiles: any[] = [];
    let documents: any[] = [];

    if (allUserIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", allUserIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }
      profiles = profilesData || [];

      const { data: documentsData, error: docsError } = await supabase
        .from("onboarding_documents")
        .select("*")
        .in("user_id", allUserIds);

      if (docsError) {
        console.error("Error fetching documents:", docsError);
      }
      documents = documentsData || [];

      console.log(
        "Fetched profiles:",
        profiles.length,
        "Fetched documents:",
        documents.length,
      );
    }

    const tenantRows = (tenants.data || []).map((r: any) => ({
      ...r,
      role: "tenant" as const,
      profile: profiles.find((p) => p.id === r.user_id),
      documents: documents.filter((d) => d.user_id === r.user_id),
    }));

    const landlordRows = (landlords.data || []).map((r: any) => ({
      ...r,
      role: "landlord" as const,
      profile: profiles.find((p) => p.id === r.user_id),
      documents: documents.filter((d) => d.user_id === r.user_id),
    }));

    const result = [...tenantRows, ...landlordRows];
    console.log("Pending onboarding result:", result);
    return result;
  },

  async getDocumentSignedUrl(
    storagePath: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    const { data, error } = await supabase.storage
      .from("onboarding-documents")
      .createSignedUrl(storagePath, expiresIn);

    if (error) {
      console.warn("Failed to create signed URL:", error);
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }
    return data.signedUrl;
  },

  async getDocumentSignedUrlWithExpiry(
    storagePath: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    return this.getDocumentSignedUrl(storagePath, expiresIn);
  },

  async adminUpdateVerificationStatus(
    adminId: string,
    userId: string,
    role: UserRole,
    status: VerificationStatus,
  ): Promise<void> {
    if (role === "admin") return;
    const table =
      role === "tenant" ? "tenant_onboarding" : "landlord_onboarding";
    const { error } = await supabase
      .from(table)
      .update({
        verification_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
    if (error) throw error;
    // Audit log
    await supabase.from("audit_logs").insert({
      admin_id: adminId,
      action: `${status}_user_onboarding`,
      target_type: "user",
      target_id: userId,
      notes: `Set ${role} verification to ${status}`,
    });
  },

  async getVerificationStatus(
    userId: string,
    role: UserRole,
  ): Promise<VerificationStatus> {
    if (role === "admin") return "approved";

    const table =
      role === "tenant" ? "tenant_onboarding" : "landlord_onboarding";
    const { data, error } = await supabase
      .from(table)
      .select("verification_status")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      console.warn("Verification status unavailable:", error?.message);
      return "pending";
    }

    return (data.verification_status as VerificationStatus) ?? "pending";
  },

  async saveTenant(userId: string, values: TenantOnboardingInput) {
    const { data, error } = await supabase
      .from("tenant_onboarding")
      .upsert(
        {
          user_id: userId,
          ...values,
          completed: true,
          verification_status: "pending",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select()
      .single();

    if (error) throw error;
    return data as TenantOnboarding;
  },

  async saveLandlord(userId: string, values: LandlordOnboardingInput) {
    const { data, error } = await supabase
      .from("landlord_onboarding")
      .upsert(
        {
          user_id: userId,
          ...values,
          completed: true,
          verification_status: "pending",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select()
      .single();

    if (error) throw error;
    return data as LandlordOnboarding;
  },

  async uploadDocument(
    userId: string,
    role: OnboardingRole,
    documentType: OnboardingDocumentType,
    file: File,
  ) {
    const extension = file.name.split(".").pop() || "bin";
    const safeName = `${documentType}-${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const storagePath = `${userId}/${safeName}`;

    await supabase
      .from("onboarding_documents")
      .delete()
      .eq("user_id", userId)
      .eq("document_type", documentType);

    const { error: uploadError } = await supabase.storage
      .from("onboarding-documents")
      .upload(storagePath, file, { upsert: false });

    if (uploadError) throw uploadError;

    const { data, error } = await supabase
      .from("onboarding_documents")
      .insert({
        user_id: userId,
        role,
        document_type: documentType,
        storage_path: storagePath,
        file_name: file.name,
        mime_type: file.type || null,
        review_status: "pending",
      })
      .select()
      .single();

    if (error) throw error;
    return data as OnboardingDocument;
  },
};
