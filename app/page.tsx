import { getServerSession } from "next-auth";
import { BtcTracker } from "@/components/BtcTracker";
import { Header } from "@/components/Header";

export default async function Home() {
  const session = await getServerSession();

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col">
      <Header session={session} />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <BtcTracker session={session} />
      </div>
      <footer className="text-center py-6 text-gray-600 text-sm">
        <p>
          Data from{" "}
          <a
            href="https://www.coingecko.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-500 hover:text-orange-400 transition-colors"
          >
            CoinGecko
          </a>{" "}
          · Updates every 30s
        </p>
      </footer>
    </main>
  );
}
