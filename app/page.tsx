"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [licenseKey, setLicenseKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (!licenseKey.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/verify-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ license_key: licenseKey.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        localStorage.setItem("clawconfig_unlocked", "true");
        router.push("/generate");
      } else {
        setError("Invalid license key. Purchase below to get one.");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            🦞 ClawConfig
          </h1>
          <p className="text-xl text-zinc-400">
            Generate your OpenClaw <code className="text-amber-400">SOUL.md</code> and{" "}
            <code className="text-amber-400">AGENTS.md</code> in seconds.
          </p>
          <p className="text-zinc-500 text-sm">
            Describe your project. Get production-ready configs. No guessing.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "⚡", title: "Instant", desc: "Configs ready in under 10 seconds" },
            { icon: "🎯", title: "Precise", desc: "Tailored to your exact use case" },
            { icon: "📦", title: "Ready to use", desc: "Drop files into your workspace and go" },
          ].map((f) => (
            <div key={f.title} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center space-y-2">
              <div className="text-2xl">{f.icon}</div>
              <div className="font-semibold text-amber-400">{f.title}</div>
              <div className="text-zinc-500 text-sm">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Unlock form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Already have a license?</h2>
            <p className="text-zinc-500 text-sm">Enter your key to unlock the generator.</p>
          </div>
          <form onSubmit={handleUnlock} className="flex gap-3">
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-5 py-2.5 rounded-lg text-sm transition disabled:opacity-50"
            >
              {loading ? "Checking..." : "Unlock"}
            </button>
          </form>
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="border-t border-zinc-800 pt-6 space-y-3">
            <p className="text-zinc-400 text-sm">Don&apos;t have a license yet?</p>
            <a
              href="https://gumroad.com/l/clawconfig"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-amber-400 font-semibold px-6 py-3 rounded-lg text-sm transition"
            >
              Buy ClawConfig — $5 one-time →
            </a>
          </div>
        </div>

        <p className="text-center text-zinc-700 text-xs">
          ClawConfig · One-time purchase · No subscription · Works with any OpenClaw setup
        </p>
      </div>
    </main>
  );
}
