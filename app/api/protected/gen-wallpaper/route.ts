import { respData, respErr } from "@/lib/resp";

import { User } from "@/types/user";
import { Poetry } from "@/types/poetry";
import { currentUser } from "@clerk/nextjs";
import { getOpenAIClient } from "@/services/openai";
import { getUserCredits } from "@/services/order";
import { insertPoetry } from "@/models/poetry";
import { saveUser } from "@/services/user";

export async function POST(req: Request) {
  const client = getOpenAIClient();

  const user = await currentUser();
  if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
    return respErr("no auth");
  }

  try {
    const { description } = await req.json();
    if (!description) {
      return respErr("invalid params");
    }

    // save user
    const user_email = user.emailAddresses[0].emailAddress;
    const nickname = user.firstName;
    const avatarUrl = user.imageUrl;
    const userInfo: User = {
      email: user_email,
      nickname: nickname || "",
      avatar_url: avatarUrl,
    };

    await saveUser(userInfo);

    const user_credits = await getUserCredits(user_email);
    if (!user_credits || user_credits.left_credits < 1) {
      return respErr("credits not enough");
    }

    const llm_name = "gpt-3.5-turbo-0125";
    const created_at = new Date().toISOString();

    const prompt = `
你是一个当代诗人，根据输入提示写一首诗：
格式：
{第一句}
{第二句}
{第三句}
{第四句}`;

    const res = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: description,
        },
      ],
      model: llm_name,
    });

    const poetry_text = res.choices[0].message.content;
    if (!poetry_text) {
      return respErr("generate poetry failed");
    }

    console.log("poetry gen success", poetry_text);

    const poetry: Poetry = {
      user_email: user_email,
      poetry_description: description,
      poetry_text,
      llm_name: llm_name,
      llm_params: JSON.stringify({}),
      created_at: created_at,
    };
    await insertPoetry(poetry);

    return respData(poetry);
  } catch (e) {
    console.log("generate wallpaper failed: ", e);
    return respErr("generate wallpaper failed");
  }
}
