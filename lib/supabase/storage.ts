import { createClient } from "./client";

export const STORAGE_BUCKET = "note-attachments";

export interface UploadedFile {
  name: string;
  url: string;
  size: number;
  type: string;
}

export async function uploadFile(file: File): Promise<UploadedFile> {
  const supabase = createClient();

  const ext = file.name.split(".").pop() ?? "bin";
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${safeName}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) throw new Error(`File upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path);

  return {
    name: file.name,
    url: publicUrl,
    size: file.size,
    type: file.type || `application/${ext}`,
  };
}

export async function uploadFiles(files: File[]): Promise<UploadedFile[]> {
  return Promise.all(files.map(uploadFile));
}
