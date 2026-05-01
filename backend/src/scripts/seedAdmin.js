/**
 * Creates or updates an admin user from environment variables.
 * Usage: set ADMIN_EMAIL, ADMIN_PASSWORD, (optional) ADMIN_NAME in .env, then:
 *   npm run seed:admin
 *
 * Requires MONGODB_URI and JWT_SECRET in .env (validateEnv is not run here;
 * only DB connection is needed).
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const connect = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required in .env');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
};

const main = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'Administrator';

  if (!email || !password) {
    throw new Error(
      'Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before running seed:admin.'
    );
  }

  await connect();

  const existing = await User.findOne({ email });

  if (existing) {
    existing.name = name;
    existing.password = password;
    existing.role = 'admin';
    await existing.save();
    console.info(`Updated existing user to admin: ${email}`);
  } else {
    await User.create({
      name,
      email,
      password,
      role: 'admin',
    });
    console.info(`Created admin user: ${email}`);
  }

  await mongoose.connection.close(false);
  process.exit(0);
};

main().catch((err) => {
  console.error(err);
  mongoose.connection
    .close(false)
    .finally(() => process.exit(1));
});
