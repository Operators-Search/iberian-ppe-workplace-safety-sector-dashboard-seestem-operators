import type { NextRequest } from "next/server";
import { getSectorCode } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function isAuthorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return true;
  }

  return request.headers.get("authorization") === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const sectorCode = getSectorCode();
  const supabase = createSupabaseServerClient();

  const [sectorResult, companyResult] = await Promise.all([
    supabase.from("sectors").select("sector_code").eq("sector_code", sectorCode).limit(1),
    supabase.from("companies").select("sector_code,bvd_code").eq("sector_code", sectorCode).limit(1),
  ]);

  if (sectorResult.error || companyResult.error) {
    return Response.json(
      {
        ok: false,
        sectorCode,
        error: sectorResult.error?.message ?? companyResult.error?.message,
        checkedAt: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return Response.json(
    {
      ok: true,
      sectorCode,
      sectorFound: (sectorResult.data ?? []).length > 0,
      companyProbeFound: (companyResult.data ?? []).length > 0,
      checkedAt: new Date().toISOString(),
      latencyMs: Date.now() - startedAt,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
