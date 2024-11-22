import fetch from "node-fetch";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const path = params.path;

  if (!path) {
    return NextResponse.json({ error: "Not Found" });
  }

  let pathArray = Array.isArray(path) ? path : [path];

  if (pathArray[0] === "data") {
    try {
      const response = await fetch("https://gpts.ddaiai.com/open/gpts");
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json({ error: "Failed to fetch data" });
    }
  } else if (pathArray[0] === "list") {
    const page = pathArray[1] || "14300";
    try {
      const response = await fetch(
        `https://gpts.ddaiai.com/open/gptsapi/list/${page}`,
      );
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json({ error: "Failed to fetch list" });
    }
  } else if (pathArray[0] === "query") {
    const query = req.nextUrl.searchParams.get("q");
    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" });
    }
    try {
      const response = await fetch(
        `https://gpts.ddaiai.com/open/gptsapi/search?q=${query}`,
      );
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json({ error: "Failed to fetch query results" });
    }
  } else {
    return NextResponse.json({ error: "Not Found" });
  }
}
