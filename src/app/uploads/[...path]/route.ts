import { NextRequest, NextResponse } from "next/server";

const getBackendUrl = () => {
  const raw = (
    process.env.NEXT_PUBLIC_BASE_API_URL ||
    process.env.BASE_API_URL ||
    ""
  ).trim();
  return raw.replace(/\/+$/, "").replace(/\/api$/, "");
};

async function handleUploads(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const backendBase = getBackendUrl();
  if (!backendBase) {
    return new NextResponse("Backend API URL not configured", { status: 502 });
  }

  const subpath = (path || []).join("/");
  const targetUrl = `${backendBase}/uploads/${subpath}${request.nextUrl.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");

  try {
    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
    });

    const responseHeaders = new Headers(res.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");

    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Proxy uploads error:", error);
    return new NextResponse("Failed to fetch image", { status: 502 });
  }
}

export const GET = handleUploads;
export const HEAD = handleUploads;
