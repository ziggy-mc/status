import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { ADMIN_DISCORD_ID } from "../../../lib/constants";

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
  ],

  session: {
    maxAge: 86400,
  },

  cookies: {
    state: {
      name: "__Secure-next-auth.state",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
  },

  callbacks: {
  async jwt({ token, profile }) {
    if (profile) {
      token.sub = profile.id;
      token.email = profile.email;
      token.name = profile.username || profile.global_name || profile.name;
    }

    return token;
  },

  async session({ session, token }) {
    session.user.id = token.sub;
    session.user.username =
      token.name || session.user.name;

    return session;
  },

  async redirect({ url, baseUrl }) {
    if (url.startsWith("/")) return `${baseUrl}${url}`;
    if (new URL(url).origin === baseUrl) return url;
    return `${baseUrl}/select`;
  },
},
});
