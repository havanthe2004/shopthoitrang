import jwt, { SignOptions } from "jsonwebtoken";

const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRE,
  JWT_REFRESH_EXPIRE,
} = process.env;

if (
  !JWT_ACCESS_SECRET ||
  !JWT_REFRESH_SECRET ||
  !JWT_ACCESS_EXPIRE ||
  !JWT_REFRESH_EXPIRE
) {
  throw new Error("Missing JWT environment variables");
}

export const signAccessToken = (payload: object) => {
  const options: SignOptions = {
    expiresIn: JWT_ACCESS_EXPIRE as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, JWT_ACCESS_SECRET, options);
};

export const signRefreshToken = (payload: object) => {
  const options: SignOptions = {
    expiresIn: JWT_REFRESH_EXPIRE as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, options);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};
