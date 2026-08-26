import { NextRequest, NextResponse } from "next/server";

const getBackendUrl = () => {
  const raw = (
    process.env.NEXT_PUBLIC_BASE_API_URL ||
    process.env.BASE_API_URL ||
    ""
  ).trim();
  return raw.replace(/\/+$/, "").replace(/\/api$/, "");
};

async function handleProxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const backendBase = getBackendUrl();
  if (!backendBase) {
    return new NextResponse(
      JSON.stringify({ message: "Backend API URL not configured in environment" }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }

  const subpath = (path || []).join("/");
  const targetUrl = `${backendBase}/api/panel/${subpath}${request.nextUrl.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");

  try {
    const fetchInit: RequestInit = {
      method: request.method,
      headers,
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      fetchInit.body = request.body;
      // @ts-expect-error - duplex is supported in Next.js runtime fetch
      fetchInit.duplex = "half";
    }

    const res = await fetch(targetUrl, fetchInit);

    const responseHeaders = new Headers(res.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");

    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Proxy error to backend:", targetUrl, error);
    return new NextResponse(
      JSON.stringify({ message: "Failed to connect to backend API", error: String(error) }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
