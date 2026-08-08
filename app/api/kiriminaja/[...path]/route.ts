import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const apiKey = process.env.KIRIMINAJA_API_KEY;
  const baseUrl = process.env.KIRIMINAJA_BASE_URL;

  if (!apiKey || !baseUrl) {
    return NextResponse.json(
      { error: "KiriminAja credentials not configured" },
      { status: 500 },
    );
  }

  const { path: pathSegments } = await params;
  const path = pathSegments.join("/");
  const upstreamUrl = `${baseUrl}/api/mitra/${path}`;

  let body: unknown = undefined;
  try {
    body = await request.json();
  } catch {
    // Body may be empty for endpoints with no payload (e.g. province)
  }

  const upstream = await fetch(upstreamUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
