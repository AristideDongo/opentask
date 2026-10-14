import { hash, verify } from '@node-rs/argon2';
import { ARGON2_OPTIONS } from './auth.const';

export const hashPassword = (password: string) => hash(password, ARGON2_OPTIONS);

export const verifyPassword = ({ hash: digest, password }: { hash: string; password: string }) =>
  verify(digest, password);
