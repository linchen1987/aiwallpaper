import { respData, respErr } from "@/lib/resp";

import { getPoetries } from "@/models/poetry";

export async function POST(req: Request) {
  try {
    const { page } = await req.json();
    const poetries = await getPoetries(page || 1, 100);

    return respData(poetries);
  } catch (e) {
    console.log("get poetries failed: ", e);
    return respErr("get poetries failed");
  }
}
