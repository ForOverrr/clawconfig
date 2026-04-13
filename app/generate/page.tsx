"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface GenerateResult {
  soul: string;
  agents: string;
}

export default function GeneratePage() {
  const router = useRouter();
  const [project, setProject] = useState("");
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState("Professional");
  const [rules, setRules] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const unlocked = localStorage.getItem("clawconfig_unlocked");
      if (!unlocked) router.replace("/");
    }
  }, [router]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!project.trim() || !purpose.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, purpose, tone, rules }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Generation failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function downloadFile(content: string, filename: string) {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">🦞 ClawConfig</h1>
          <button
            onClick={() => router.push("/")}
            className="text-zinc-500 hover:text-zinc-300 text-sm transition"
          >
            ← Back
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">
          <h2 className="text-lg font-semibold text-amber-400">Describe your setup</h2>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400 font-medium">What is your project?</label>
            <input
              type="text"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="e.g. A SaaS startup that builds developer tools"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400 font-medium">What should your AI do?</label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Act as a product manager, help prioritize features, write specs, and coordinate between engineering and design teams"
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400 font-medium">Tone / personality</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {["Professional", "Casual", "Snarky", "Warm"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400 font-medium">
              Special rules or limits <span className="text-zinc-600">(optional)</span>
            </label>
            <textarea
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              placeholder="e.g. Never discuss competitors. Always ask for budget before making recommendations. Escalate blockers immediately."
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold py-3 rounded-lg text-sm transition disabled:opacity-50"
          >
            {loading ? "Generating your configs..." : "Generate SOUL.md + AGENTS.md →"}
          </button>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-amber-400">Your configs are ready</h2>

            {[
              { key: "soul", filename: "SOUL.md", content: result.soul },
              { key: "agents", filename: "AGENTS.md", content: result.agents },
            ].map(({ key, filename, content }) => (
              <div key={key} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                  <span className="font-mono font-semibold text-amber-400">{filename}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(content, key)}
                      className="text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg text-zinc-300 transition"
                    >
                      {copied === key ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={() => downloadFile(content, filename)}
                      className="text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-3 py-1.5 rounded-lg transition"
                    >
                      Download
                    </button>
                  </div>
                </div>
                <pre className="p-6 text-sm text-zinc-300 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                  {content}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
