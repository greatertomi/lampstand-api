import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import envConfig from '../config/envConfig';
import { logger } from '../services';
import { JwtPayload } from '../types';

const appleJwksClient = jwksClient({
  jwksUri: 'https://appleid.apple.com/auth/keys'
});

export const JwtHelper = {
  generateToken: (data: JwtPayload) => jwt.sign(data, envConfig.JWT_SECRET, { expiresIn: '3d' }),
  verifyToken: (token: string): JwtPayload => {
    try {
      return jwt.verify(token, envConfig.JWT_SECRET) as JwtPayload;
    } catch (error) {
      logger.error({
        location: 'JwtHelper.verifyToken',
        error: error.message,
        message: `Error verifying token: ${error.message}`
      });
      throw error;
    }
  },
  verifyAppleToken: async (
    token: string,
    expectedNonce: string
  ): Promise<{ email: string; nonce: string }> => {
    try {
      // 1. Decode token to get header info
      const decodedToken = jwt.decode(token, { complete: true });
      if (!decodedToken) {
        throw new Error('Invalid Apple token');
      }

      const { kid, alg } = decodedToken.header;

      // 2. Get Apple's public key
      const applePublicKey = await appleJwksClient.getSigningKey(kid);
      const signingKey = applePublicKey.getPublicKey();

      // 3. Verify token
      const payload = jwt.verify(token, signingKey, {
        algorithms: [alg as jwt.Algorithm],
        audience: envConfig.APPLE_BUNDLE_ID,
        issuer: 'https://appleid.apple.com'
      }) as jwt.JwtPayload;

      // 4. Verify nonce
      if (payload.nonce !== expectedNonce) {
        throw new Error('Nonce does not match');
      }

      if (!payload.email) {
        throw new Error('Email not found in Apple token');
      }

      return {
        email: payload.email,
        nonce: payload.nonce
      };
    } catch (error) {
      logger.error('Apple token verification failed:', error);
      throw error;
    }
  }
};
