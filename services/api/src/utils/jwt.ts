import jwt, { TokenExpiredError, JsonWebTokenError, SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import config from '../config';

export interface TokenPayload {
  userId: string;
  email: string;
  status: string;
}

/**
 * Generate access token
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as StringValue,
  };
  return jwt.sign(payload, config.jwt.secret, options);
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn as StringValue,
  };
  return jwt.sign(payload, config.jwt.refreshSecret, options);
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, config.jwt.secret) as TokenPayload;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new Error('Access token has expired');
    } else if (error instanceof JsonWebTokenError) {
      throw new Error('Invalid access token');
    }
    throw new Error('Failed to verify access token');
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new Error('Refresh token has expired');
    } else if (error instanceof JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    throw new Error('Failed to verify refresh token');
  }
};

/**
 * Generate token pair (access + refresh)
 */
export const generateTokenPair = (payload: TokenPayload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};
