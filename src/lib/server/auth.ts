import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { username } from 'better-auth/plugins';
import { MongoClient } from 'mongodb';
import { Resend } from 'resend';
import { DATABASE_URL, BETTER_AUTH_SECRET, APP_URL, RESEND_API_KEY } from '$env/static/private';

const client = new MongoClient(DATABASE_URL);
const resend = new Resend(RESEND_API_KEY);

export const auth = betterAuth({
	baseURL: APP_URL ?? 'http://localhost:5173',
	secret: BETTER_AUTH_SECRET,
	database: mongodbAdapter(client.db('treetag')),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url }) => {
			await resend.emails.send({
				from: 'Treetag <noreply@treetag.joshbaker.gg>',
				to: user.email,
				subject: 'Reset your password',
				html: `<a href="${url}">Click here to reset your password</a>`
			});
		}
	},
	emailVerification: {
		sendVerificationEmail: async ({ user, url }) => {
			await resend.emails.send({
				from: 'Treetag <noreply@treetag.joshbaker.gg>',
				to: user.email,
				subject: 'Verify your email address',
				html: `<a href="${url}">Click here to verify your email</a>`
			});
		},
		sendOnSignUp: true
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
