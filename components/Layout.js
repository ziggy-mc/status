const COPYRIGHT_START_YEAR = 2025;

export default function Layout({ children, title }) {
  const currentYear = new Date().getFullYear();
  const copyrightYear = currentYear > COPYRIGHT_START_YEAR ? `${COPYRIGHT_START_YEAR}-${currentYear}` : COPYRIGHT_START_YEAR;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center">
    <link rel="icon" type="image/x-icon" href="favicon" />
      <main className="max-w-3xl w-full p-6">
        {title && (
          <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 text-center">
            {title}
          </h1>
        )}

        {children}
      </main>

      <footer className="mt-auto pb-6 text-gray-400 text-sm text-center">
        &copy; {copyrightYear} muiwzi services (muizi) — All rights reserved.
      </footer>
    </div>
  );
}
