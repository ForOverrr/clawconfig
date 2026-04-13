import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

let openai: OpenAI;

export async function POST(req: NextRequest) {
  try {
    if (!openai) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { project, purpose, tone, rules } = await req.json();

    if (!project || !purpose) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userPrompt = `
Project: ${project}
What the AI should do: ${purpose}
Tone/personality: ${tone}
Special rules: ${rules || "None"}
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert OpenClaw configuration writer. OpenClaw is a self-hosted AI gateway that lets people run personal AI assistants accessible from any messaging app.

SOUL.md defines the assistant's personality, tone, core rules, and behavior guidelines. It should be concise (15-30 lines), opinionated, and immediately reflect the described personality. Use short punchy lines, not prose paragraphs.

AGENTS.md defines sub-agent roles if the setup needs multiple specialized agents (research, build, QA, etc). If the use case is simple/single-agent, keep AGENTS.md minimal — just define the main agent role and 2-3 key commands.

Generate both files. Return ONLY valid markdown for each file — no explanations, no preamble. Use this exact format:

===SOUL.md===
[content here]

===AGENTS.md===
[content here]`,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const raw = completion.choices[0].message.content || "";

    const soulMatch = raw.match(/===SOUL\.md===([\s\S]*?)(?:===AGENTS\.md===|$)/);
    const agentsMatch = raw.match(/===AGENTS\.md===([\s\S]*?)$/);

    const soul = soulMatch ? soulMatch[1].trim() : raw;
    const agents = agentsMatch ? agentsMatch[1].trim() : "# AGENTS\n\nNo sub-agents configured.";

    return NextResponse.json({ soul, agents });
  } catch (err: unknown) {
    console.error("Generate error:", err);
    return NextResponse.json(
      { error: "Generation failed. Check your OpenAI API key." },
      { status: 500 }
    );
  }
}
