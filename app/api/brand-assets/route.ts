import { getBrandAssets } from "@/lib/services/upload.service";
import { ok, err }        from "@/lib/api/response";

export async function GET(): Promise<Response> {
  try {
    const assets = await getBrandAssets();
    return ok(assets);
  } catch (error) {
    console.error("[GET /api/brand-assets]", error);
    return err("Failed to retrieve brand assets", 500);
  }
}
