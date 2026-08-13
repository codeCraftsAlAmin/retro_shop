"use server";

import { setCookie } from "./cookieUtils";
// ======================================follow this approach only for jwt================================ //

// import jwt, { JwtPayload } from "jsonwebtoken";

// const getTokenSecondsRemaining = (token: string): number => {
//   if (!token) return 0;

//   try {
//     const tokenPayload = jwt.decode(token) as JwtPayload;

//     if (tokenPayload && !tokenPayload.exp) return 0;

//     const remainingSeconds =
//       (tokenPayload.exp as number) - Math.floor(Date.now() / 1000);

//     return remainingSeconds > 0 ? remainingSeconds : 0;
//   } catch (error) {
//     console.error("Error decoding token:", error);
//     return 0;
//   }
// };

// export const setTokenInCookies = async (
//   name: string,
//   token: string,
//   fallbackMaxAgeInSeconds = 60 * 60 * 24, // 1 days
// ) => {
//   let maxAgeInSeconds;

//   if (name !== "better-auth.session_token") {
//     maxAgeInSeconds = getTokenSecondsRemaining(token);
//   }

//   await setCookie(name, token, maxAgeInSeconds || fallbackMaxAgeInSeconds);
// };

// ======================================follow this approach only for better auth================================ //
export default async function setTokenInCookies(
  name: string,
  token: string,
  maxAge = 60 * 60 * 24,
) {
  await setCookie(name, token, maxAge);
}
