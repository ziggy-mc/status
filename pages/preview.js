import Head from "next/head";

const COPYRIGHT_START_YEAR = 2025;

export default function Preview() {
  const currentYear = new Date().getFullYear();
  const copyrightYear = currentYear > COPYRIGHT_START_YEAR ? `${COPYRIGHT_START_YEAR}-${currentYear}` : COPYRIGHT_START_YEAR;
  
  return (
    <>
      <Head>
        <title>System Status | Zavro Discord Bot</title>
        <meta property="og:title" content="System Status | Zavro Discord Bot" />
        <meta
          property="og:description"
          content="Check the current status of Zavro Discord Bot services like API, Commands, Services, and much more."
        />
        <meta property="og:url" content="https://ziggyminecraft.vercel.app/preview" />
        <meta property="og:type" content="website" />
        <meta name="theme-color" content="#5865F2" />
        <meta
          property="og:image"
          content="https://ziggyminecraft.vercel.app/ogimage.png"
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-center">
        <main className="max-w-3xl w-full p-6 text-center">
          <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            System Status
          </h1>

          <p className="text-gray-300 text-lg mb-8">
             Are systems operational? 🚀  
            <br />
            Check live service uptime for the Zavro Discord Bot.
          </p>

          <button
            onClick={() => (window.location.href = "/")}
            className="bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all text-white font-bold py-2 px-6 rounded-lg shadow-md"
          >
            View Full Dashboard
          </button>
        </main>

        <footer className="mt-auto pb-6 text-gray-400 text-sm text-center">
          &copy; {copyrightYear} Zavro Discord Bot — Made By ziggymc
        </footer>
      </div>
    </>
  );
}