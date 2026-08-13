import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const validEnvironments = new Set(["staging", "production"]);
const commitShaPattern = /^[0-9a-f]{40}$/;

export function GET() {
  const configuredEnvironment = process.env.APP_ENV?.trim();
  const configuredRevision = process.env.APP_REVISION?.trim().toLowerCase();

  return NextResponse.json(
    {
      status: "ok",
      service: "aurevia-gaming",
      environment:
        configuredEnvironment && validEnvironments.has(configuredEnvironment)
          ? configuredEnvironment
          : "local",
      revision:
        configuredRevision && commitShaPattern.test(configuredRevision)
          ? configuredRevision
          : "unknown",
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
