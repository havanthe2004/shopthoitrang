import bcrypt from "bcrypt";

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (
  password: string,
  hash: string
) => {
  return bcrypt.compare(password, hash);
};
