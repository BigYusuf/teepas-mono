import * as crypto from 'crypto';

export const generateKey = (prefix: string) => {
  return `${prefix}_${crypto.randomBytes(24).toString('hex')}`;
};
