import { type UniSeeListModelResponse } from "@/app/client/platforms/unisee";
import { getServerSideConfig } from "@/app/config/server";
import { ModelProvider, UniSeePath, MidjourneyPath } from "@/app/constant";
import { prettyObject } from "@/app/utils/format";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../auth";
import { requestUniSee } from "../common";

const ALLOWED_PATH = new Set(Object.values(UniSeePath));
// 增加
Object.values(MidjourneyPath).forEach((path) => ALLOWED_PATH.add(path));

function getModels(remoteModelRes: UniSeeListModelResponse) {
  const config = getServerSideConfig();

  if (config.disableGPT4) {
    remoteModelRes.data = remoteModelRes.data.filter(
      (m) => !m.id.startsWith("gpt-4"),
    );
  }

  return remoteModelRes;
}

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  console.log("[UniSee Route] params ", params);

  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  const subpath = params.path.join("/");

  if (!ALLOWED_PATH.has(subpath)) {
    console.log("[UniSee Route] forbidden path ", subpath);
    return NextResponse.json(
      {
        error: true,
        msg: "you are not allowed to request " + subpath,
      },
      {
        status: 403,
      },
    );
  }

  const authResult = auth(req, ModelProvider.GPT);
  if (authResult.error) {
    return NextResponse.json(authResult, {
      status: 401,
    });
  }

  try {
    const response = await requestUniSee(req);

    // list models
    if (subpath === UniSeePath.ListModelPath && response.status === 200) {
      const resJson = (await response.json()) as UniSeeListModelResponse;
      const availableModels = getModels(resJson);
      return NextResponse.json(availableModels, {
        status: response.status,
      });
    }

    return response;
  } catch (e) {
    console.error("[UNISEE] r", e);
    return NextResponse.json(prettyObject(e));
  }
}

export const GET = handle;
export const POST = handle;

export const runtime = "edge";
export const preferredRegion = [
  "arn1",
  "bom1",
  "cdg1",
  "cle1",
  "cpt1",
  "dub1",
  "fra1",
  "gru1",
  "hnd1",
  "iad1",
  "icn1",
  "kix1",
  "lhr1",
  "pdx1",
  "sfo1",
  "sin1",
  "syd1",
];
