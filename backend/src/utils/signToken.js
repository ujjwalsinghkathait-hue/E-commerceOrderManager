import jwt from 'jsonwebtoken';

/**
 * @param {string} userId - MongoDB user _id as string
 */
export const signToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign({ id: userId }, secret, { expiresIn });
};
