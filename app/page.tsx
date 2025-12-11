"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setShowInstall(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100">
      <main className="w-full max-w-xl rounded-xl bg-white p-10 shadow-xl text-center">
        
        <Image
          src="/icons/leaf.png"
          alt="App Logo"
          width={80}
          height={80}
          className="mx-auto mb-4"
        />

        <h1 className="text-2xl font-bold text-gray-900">
          Institute Project Staff Management
        </h1>


        {showInstall && (
          <button
            onClick={installApp}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition"
          >
            Install App
          </button>
        )}

        
      </main>
    </div>
  );
}
