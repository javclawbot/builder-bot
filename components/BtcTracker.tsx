"use client";

import { useEffect, useState, useCallback } from "react";
import { signIn } from "next-auth/react";
import { Session } from "next-auth";

interface BtcData {
  usd: number;
  usd_24h_change: number;
}

interface HeaderProps {
  session: Session | null;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function BtcTracker({ session }: HeaderProps) {
  const [btcData, setBtcData] = useState<BtcData | null>(null);
  const [prevPrice, setPrevPrice] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [priceFlash, setPriceFlash] = useState<"up" | "down" | null>(null);

  const fetchPrice = useCallback(async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true",
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const newPrice = data.bitcoin.usd;

      setBtcData((prev) => {
        if (prev && prev.usd !== newPrice) {
          setPriceFlash(newPrice > prev.usd ? "up" : "down");
          setPrevPrice(prev.usd);
          setTimeout(() => setPriceFlash(null), 1000);
        }
        return {
          usd: newPrice,
          usd_24h_change: data.bitcoin.usd_24h_change,
        };
      });

      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError("Unable to fetch price. Retrying...");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + 30s interval
  useEffect(() => {
    fetchPrice();
    const interval = setInterval(() => {
      fetchPrice();
      setCountdown(30);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const change24h = btcData?.usd_24h_change ?? 0;
  const isPositive = change24h >= 0;

  return (
    <div className="w-full max-w-2xl mx-auto fade-in">
      {/* Main Price Card */}
      <div className="card-dark rounded-2xl p-8 sm:p-10 btc-glow mb-6">
        {/* Bitcoin icon + label */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-black font-bold text-xl pulse-ring">
            ₿
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Bitcoin</h1>
            <p className="text-gray-500 text-sm">BTC / USD</p>
          </div>
        </div>

        {/* Price display */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4" />
            <p className="text-gray-500">Fetching live price...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        ) : btcData ? (
          <div className="text-center">
            {/* Price */}
            <div
              className={`text-5xl sm:text-6xl font-bold mb-3 transition-colors duration-300 ${
                priceFlash === "up"
                  ? "text-green-400"
                  : priceFlash === "down"
                  ? "text-red-400"
                  : "price-gradient"
              }`}
            >
              {formatPrice(btcData.usd)}
            </div>

            {/* 24h change */}
            <div
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 ${
                isPositive
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              <span>{isPositive ? "▲" : "▼"}</span>
              <span>
                {Math.abs(change24h).toFixed(2)}% (24h)
              </span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-800">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                  24h Change
                </p>
                <p
                  className={`text-lg font-semibold ${
                    isPositive ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {change24h.toFixed(2)}%
                </p>
              </div>
              <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-800">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                  Last Updated
                </p>
                <p className="text-lg font-semibold text-white">
                  {lastUpdated ? formatTime(lastUpdated) : "—"}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Refresh countdown */}
        {!loading && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="flex items-center gap-2 text-gray-600 text-xs">
              <div className="relative w-4 h-4">
                <svg className="w-4 h-4 -rotate-90" viewBox="0 0 16 16">
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    fill="none"
                    stroke="#374151"
                    strokeWidth="2"
                  />
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    fill="none"
                    stroke="#F7931A"
                    strokeWidth="2"
                    strokeDasharray={`${2 * Math.PI * 6}`}
                    strokeDashoffset={`${2 * Math.PI * 6 * (1 - countdown / 30)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
              </div>
              <span>
                Refreshes in{" "}
                <span className="text-orange-500 font-medium">{countdown}s</span>
              </span>
              <button
                onClick={() => { fetchPrice(); setCountdown(30); }}
                className="ml-1 text-orange-500 hover:text-orange-400 underline underline-offset-2"
              >
                refresh now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Auth CTA for signed-out users */}
      {!session?.user && (
        <div className="card-dark rounded-2xl p-6 text-center">
          <div className="text-2xl mb-2">🔐</div>
          <h2 className="text-white font-semibold mb-1">
            Sign in to track your portfolio
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Get personalized insights and save your watchlist
          </p>
          <button
            onClick={() => signIn("google")}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-black font-semibold px-6 py-2.5 rounded-lg transition-all active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      )}

      {/* Welcome card for signed-in users */}
      {session?.user && (
        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-sm font-medium">
              Live tracking active
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            Welcome back,{" "}
            <span className="text-white font-medium">
              {session.user.name?.split(" ")[0]}
            </span>
            ! Your Bitcoin tracker is running live with 30-second updates.
          </p>
        </div>
      )}
    </div>
  );
}
