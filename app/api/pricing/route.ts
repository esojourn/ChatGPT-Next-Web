// pages/api/pricing.ts
import fetch from "node-fetch";
import { getServerSideConfig } from "@/app/config/server";
import { prettyObject } from "@/app/utils/format";
import { NextRequest, NextResponse } from "next/server";
import type { RequestInit as NodeFetchRequestInit } from "node-fetch";

const serverConfig = getServerSideConfig();

export async function GET(req: NextRequest) {
  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  try {
    const response = await request(req);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (e) {
    console.error("[Pricing] ", e);
    return NextResponse.json(prettyObject(e), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // 这里可以添加POST方法的处理逻辑
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

async function request(req: NextRequest) {
  const controller = new AbortController();
  const apiUrl = `${serverConfig?.baseUrl}/api/pricing`;

  const timeoutId = setTimeout(
    () => {
      controller.abort();
    },
    10 * 60 * 1000,
  );

  const fetchOptions: NodeFetchRequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
    method: req.method,
    signal: controller.signal,
  };

  try {
    const res = await fetch(apiUrl, fetchOptions);
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}
