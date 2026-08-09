import Layout from "@/components/Layout";
import Link from "next/link";
import { getSession } from "next-auth/react";
import { ADMIN_DISCORD_ID } from "../lib/constants";

export default function SelectPage({ session }) {
  return (
    <Layout title="Select Page">
      <div className="flex flex-col items-center justify-center text-center mt-20">
        <h2 className="text-3xl font-bold mb-6">
          Welcome back, {session?.user?.name}!
        </h2>
        <p className="text-gray-400 mb-8">Where would you like to go today?</p>

        <div className="flex gap-6">
          <Link
            href="/admin"
            className="bg-indigo-500 hover:bg-indigo-600 px-6 py-3 rounded-lg transition text-white font-semibold"
          >
            Go to Admin Panel
          </Link>
          <Link
            href="/advanced-status"
            className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg transition text-white font-semibold"
          >
            Go to Advanced Status Page
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session || session.user.id !== ADMIN_DISCORD_ID) {
    return { redirect: { destination: "/advanced-status", permanent: false } };
  }
  return { props: { session } };
}
