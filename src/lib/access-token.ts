import { SignJWT, decodeJwt } from "jose";

type PayloadType = {
  id: string;
  name: string;
  email: string;
  picture: string | null;
  emailVerified: boolean;
  provider: string;
};

export const generateAccessToken = async ({
  payload,
}: {
  payload: PayloadType;
}) => {
  const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET!);
  const alg = "HS256";

  return await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("2d")
    .sign(secret);
};

type UserType = {
  id: string;
  name: string;
  email: string;
  picture: string;
  emailVerified: boolean;
  provider: string;
  iat: number;
  exp: number;
};

export const decodeToken = async ({
  token,
}: {
  token: string;
}): Promise<UserType> => {
  return decodeJwt(token);
};
