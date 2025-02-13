import NextAuth from 'next-auth/next';
import DiscordProvider from 'next-auth/providers/discord';
import TwitterProvider from 'next-auth/providers/twitter';

export const getNextAuthOptions = (req: any) => {
  return {
    providers: [
      TwitterProvider({
        clientId: process.env.TWITTER_CLIENT_ID || '',
        clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
        version: '2.0',
        authorization: {
          params: {
            scope: 'tweet.read users.read follows.write',
          },
        },
      }),
      DiscordProvider({
        clientId: process.env.DISCORD_CLIENT_ID || '',
        clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
        authorization: { params: { scope: 'identify' } },
      }),
    ],
    callbacks: {
      async jwt({ token, account }: any) {
        return {
          ...token,
          ...account,
        };
      },
      async session({ session, token }: any) {
        return {
          ...session,
          ...token,
        };
      },
    },
    secret: process.env.SECRET,
  };
};

export default async function auth(req: any, res: any) {
  return await NextAuth(req, res, getNextAuthOptions(req));
}
