import { requireSupabase } from "./supabase";

/**
 * Upload an image through the authenticated /api/upload route handler.
 * Sends the signed-in admin's access token; the server verifies it with Supabase
 * Auth and checks admin rights before anything is written to Storage.
 *
 * @returns the public URL of the uploaded file
 */
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export async function uploadImage(file: File, fileName: string): Promise<string> {
  const ext = EXTENSIONS[file.type];
  if (!ext) throw new Error("Only JPEG, PNG, WebP, AVIF or GIF images are allowed.");
  // Normalise the extension to the real image type (e.g. "IMG.JPG" or "photo" → ".jpg").
  const safeName = `${fileName.replace(/\.[^./]*$/, "")}.${ext}`;

  const { data } = await requireSupabase().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Your session has expired. Please sign in again.");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", safeName);

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const body = (await res.json().catch(() => ({}))) as { imageUrl?: string; error?: string };
  if (!res.ok || !body.imageUrl) {
    throw new Error(`Upload failed: ${body.error || res.statusText}`);
  }
  return body.imageUrl;
}
