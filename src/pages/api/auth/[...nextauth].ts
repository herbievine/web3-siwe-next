import type { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import { getAuthOptions } from "~/server/auth";

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const authOptions = getAuthOptions(req);

  if (!Array.isArray(req.query.nextauth)) {
    res.status(400).send("Bad request");
    return;
  }

  const isDefaultSigninPage =
    req.method === "GET" &&
    req.query.nextauth.find((value) => value === "signin");

  if (isDefaultSigninPage) {
    authOptions.providers.pop();
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await NextAuth(req, res, authOptions);
}
