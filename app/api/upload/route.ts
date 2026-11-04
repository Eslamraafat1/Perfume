import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig, STORAGE_BUCKET } from "@/lib/supabase-config";

/**
 * POST /api/upload — admin-only image upload to Supabase Storage.
 *
 * 1. Requires `Authorization: Bearer <access token>` of a signed-in Supabase user.
 * 2. Verifies the token with Supabase Auth (`auth.getUser`) and checks the user is
 *    an admin (`public.is_admin()`, backed by the `admin_users` table).
 * 3. Accepts only JPEG / PNG / WebP / AVIF / GIF up to 5 MB (MIME type AND file
 *    signature are checked; SVG is rejected because it can carry scripts).
 * 4. Uploads with the admin's own token, so Storage RLS applies as a second gate.
 *    No service-role key is used anywhere.
 */
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};
// Optional folder + safe base name + image extension, e.g. "site/cat1_image-1712-ab3.jpg"
const SAFE_FILE_NAME = /^(?:(?:site|carousel)\/)?[A-Za-z0-9_-]{1,120}\.(?:jpe?g|png|webp|avif|gif)$/i;

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/** Check the first bytes so a renamed non-image cannot pass as an image. */
function matchesSignature(bytes: Uint8Array, type: string): boolean {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end));
  switch (type) {
    case "image/jpeg":
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case "image/png":
      return bytes[0] === 0x89 && ascii(1, 4) === "PNG";
    case "image/gif":
      return ascii(0, 4) === "GIF8";
    case "image/webp":
      return ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP";
    case "image/avif":
      return ascii(4, 8) === "ftyp" && /^avi[fs]$/.test(ascii(8, 12));
    default:
      return false;
  }
}

export async function POST(request: Request) {
  // ── 1. Authentication ──────────────────────────────────────────────
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) {
    return json(401, { error: "Authentication required." });
  }
  if (!supabaseConfig) {
    return json(503, { error: "Uploads are disabled: Supabase is not configured (demo catalogue)." });
  }

  const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return json(401, { error: "Invalid or expired session." });
  }

  // ── 2. Authorization ───────────────────────────────────────────────
  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || isAdmin !== true) {
    return json(403, { error: "Admin access required." });
  }

  // ── 3. Validation ──────────────────────────────────────────────────
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BYTES + 64 * 1024) {
    return json(413, { error: "File is too large (max 5 MB)." });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json(400, { error: "Expected multipart/form-data." });
  }
  const file = formData.get("file");
  const fileName = formData.get("fileName");

  if (!(file instanceof File) || typeof fileName !== "string") {
    return json(400, { error: "Missing file or fileName." });
  }
  if (!SAFE_FILE_NAME.test(fileName)) {
    return json(400, { error: "Invalid file name." });
  }
  if (!ALLOWED_TYPES[file.type]) {
    return json(415, { error: "Only JPEG, PNG, WebP, AVIF or GIF images are allowed." });
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return json(413, { error: "File must be between 1 byte and 5 MB." });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!matchesSignature(bytes, file.type)) {
    return json(415, { error: "File content does not match its image type." });
  }

  // ── 4. Upload (as the admin, so Storage RLS also applies) ─────────
  const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) {
    console.error("[upload] Storage error:", uploadError.message);
    return json(500, { error: "Upload failed." });
  }

  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
  return json(200, { success: true, imageUrl: urlData.publicUrl });
}
