import { createClient } from "./client";

export async function uploadToStorage(file: File, bucket: "marksheets" | "resumes" | "documents" | "avatars"): Promise<{ url: string; error: string | null }> {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return { url: "", error: uploadError.message };
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (error: any) {
    console.error("Storage exception:", error);
    return { url: "", error: error.message || "Unknown error occurred during upload" };
  }
}
