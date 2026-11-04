import type { Product } from "@/app/context/ProductContext";
import { DEMO_PRODUCTS } from "@/data/demo-catalogue";
import { supabase } from "./supabase";

/**
 * Catalogue data access shared by the server (sitemap, product metadata/JSON-LD)
 * and the browser (ProductContext, product page).
 *
 * Source of truth is Supabase. The bundled demo catalogue is used instead when
 * Supabase is not configured, or when it cannot be reached / returns an error
 * (paused project, wrong key, tables not created yet), so the store never shows
 * an empty shelf because of an infrastructure problem.
 */
export type CatalogueSource = "supabase" | "demo";

// Server renders (metadata, sitemap) must not hang on a dead project; browsers can wait a bit longer.
const QUERY_TIMEOUT_MS = typeof window === "undefined" ? 3000 : 6000;

function byNewest(a: Product, b: Product) {
  return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
}

function warnFallback(context: string, reason: unknown) {
  const message = reason instanceof Error ? reason.message : String(reason);
  console.warn(`[catalogue] ${context}: Supabase unavailable (${message}); using the demo catalogue.`);
}

export function demoProducts(): Product[] {
  return [...DEMO_PRODUCTS].sort(byNewest);
}

export async function loadProducts(): Promise<{ products: Product[]; source: CatalogueSource }> {
  if (!supabase) return { products: demoProducts(), source: "demo" };
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .abortSignal(AbortSignal.timeout(QUERY_TIMEOUT_MS));
    if (error) throw new Error(error.message);
    return { products: (data ?? []) as Product[], source: "supabase" };
  } catch (err) {
    warnFallback("products", err);
    return { products: demoProducts(), source: "demo" };
  }
}

export async function loadProduct(
  id: string
): Promise<{ product: Product | null; source: CatalogueSource }> {
  const fromDemo = () => DEMO_PRODUCTS.find((p) => p.id === id) ?? null;
  if (!supabase) return { product: fromDemo(), source: "demo" };
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .abortSignal(AbortSignal.timeout(QUERY_TIMEOUT_MS))
      .maybeSingle();
    // 22P02 = the id is not a valid uuid: simply "not found", not an outage.
    if (error && error.code === "22P02") return { product: null, source: "supabase" };
    if (error) throw new Error(error.message);
    return { product: (data as Product | null) ?? null, source: "supabase" };
  } catch (err) {
    warnFallback(`product ${id}`, err);
    return { product: fromDemo(), source: "demo" };
  }
}

export async function loadRelatedProducts(
  product: Product,
  source: CatalogueSource,
  limit = 4
): Promise<Product[]> {
  const fromDemo = () =>
    demoProducts()
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, limit);
  if (!product.category) return [];
  if (source === "demo" || !supabase) return fromDemo();
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", product.category)
      .neq("id", product.id)
      .limit(limit)
      .abortSignal(AbortSignal.timeout(QUERY_TIMEOUT_MS));
    if (error) throw new Error(error.message);
    return (data ?? []) as Product[];
  } catch {
    return [];
  }
}
