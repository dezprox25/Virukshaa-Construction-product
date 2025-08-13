import { hash, compare } from "bcryptjs";

export const hashPassword = async (password: string) => await hash(password, 10);
export const verifyPassword = async (inputPassword: string, storedHash: string) => await compare(inputPassword, storedHash);
