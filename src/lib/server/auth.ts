import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';
import { env } from '$env/dynamic/private';

const client = new MongoClient(env.DATABASE_URL!);

export const auth = betterAuth({
	baseURL: env.APP_URL ?? 'http://localhost:5173',
	database: mongodbAdapter(client.db('treetag')),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false
	},
	user: {
		additionalFields: {
			role: {
				type: 'string',
				defaultValue: 'user',
				required: false,
				input: false
			},
			points: {
				type: 'number',
				defaultValue: 0,
				required: false,
				input: false
			}
		}
	},
	trustedOrigins: [env.APP_URL ?? 'http://localhost:5173']
});

export type Auth = typeof auth;
