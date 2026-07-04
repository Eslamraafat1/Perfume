import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;

    if (!file || !fileName) {
      return NextResponse.json(
        { error: "Missing file or fileName in request body" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oeatwkrkzqdiwkpzfzzf.supabase.co";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_lmOGDsQtCBU5jGrY5KXjhg_B7NZ-fY2";

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Convert File to ArrayBuffer and then Buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Supabase upload error: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      imageUrl: urlData.publicUrl,
    });
  } catch (err: any) {
    console.error("[Upload API] Error processing request:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
