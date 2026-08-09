import Layout from "@/components/Layout";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { ADMIN_DISCORD_ID } from "../lib/constants";
import { authOptions } from "./api/auth/[...nextauth]";

export default function SelectPage({ session }) {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <h1 className="text-3xl font-bold">
          Welcome back, {session?.user?.name}!
        </h1>

        <p>Where would you like to go today?</p>

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
  const session = await getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  if (session.user.id !== ADMIN_DISCORD_ID) {
    return {
      redirect: {
        destination: "/advanced-status",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
}
