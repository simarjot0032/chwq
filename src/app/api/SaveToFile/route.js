import axios from "axios";
import { NextResponse } from "next/server";
export async function POST(req) {
  const githubApiKey = process.env.NEXT_GITHUB_KEY;
  const filePath = "src/lib/data/WrongAssementData.md";
  const userData = await req.json();

  const content = JSON.stringify(userData);

  const repo = "chwq";
  const branch = "simarjot";
  const owner = "simarjot0032";
  const URL = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  try {
    const fileDetails = await axios.get(URL, {
      headers: {
        Authorization: `Bearer ${githubApiKey}`,
      },
      params: {
        ref: branch,
      },
    });
    const sha = fileDetails.data.sha;

    const existingContent = Buffer.from(
      fileDetails.data.content,
      "base64"
    ).toString("utf-8");
    const updatedContent = `${existingContent}<br> <br>${content}`;
    await axios.put(
      URL,
      {
        message: `Updating file: ${filePath}`,
        content: Buffer.from(updatedContent).toString("base64"),
        sha: sha,
        branch: branch,
      },
      {
        headers: {
          Authorization: `Bearer ${githubApiKey}`,
        },
      }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
