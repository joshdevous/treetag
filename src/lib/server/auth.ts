import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { username } from 'better-auth/plugins';
import { MongoClient } from 'mongodb';
import { DATABASE_URL, BETTER_AUTH_SECRET, APP_URL } from '$env/static/private';

const client = new MongoClient(DATABASE_URL);

export const auth = betterAuth({
	baseURL: APP_URL ?? 'http://localhost:5173',
	secret: BETTER_AUTH_SECRET,
	database: mongodbAdapter(client.db('treetag')),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false
	},
	user: {
		additionalFields: {
			role: {
				type: 'string',
				defaultValue: 'guardian',
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
	plugins: [username()],
	trustedOrigins: [APP_URL ?? 'http://localhost:5173']
});

export type Auth = typeof auth;
