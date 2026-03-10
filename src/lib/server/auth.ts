import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { username } from 'better-auth/plugins';
import { MongoClient } from 'mongodb';
import { Resend } from 'resend';
import { DATABASE_URL, BETTER_AUTH_SECRET, APP_URL, RESEND_API_KEY } from '$env/static/private';
import { emailTemplate } from './email-template';

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
				html: emailTemplate({
					heading: 'Reset your password',
					preheader: 'Follow the link to choose a new password for your Treetag account.',
					body: `Hi ${user.name ?? 'there'},<br><br>We received a request to reset the password for your Treetag account. Click the button below to choose a new one. This link will expire in 1 hour.`,
					buttonText: 'Reset Password',
					buttonUrl: url,
					footnote: "If you didn't request a password reset, you can safely ignore this email. Your password won't change."
				})
			});
		}
	},
	emailVerification: {
		sendVerificationEmail: async ({ user, url }) => {
			await resend.emails.send({
				from: 'Treetag <noreply@treetag.joshbaker.gg>',
				to: user.email,
				subject: 'Verify your email address',
				html: emailTemplate({
					heading: 'Verify your email',
					preheader: 'Confirm your email to start exploring the trees of Charlton Kings.',
					body: `Welcome to Treetag, ${user.name ?? 'Guardian'}!<br><br>Click the button below to verify your email address and activate your account. Once verified, you can start discovering, tagging, and caring for trees.`,
					buttonText: 'Verify Email',
					buttonUrl: url
				})
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
	trustedOrigins: [APP_URL ?? 'http://localhost:5173'],
	rateLimit: {
		window: 60,
		max: 30,
		customRules: {
			'/send-verification-email': { window: 60, max: 1 },
			'/forget-password': { window: 60, max: 1 }
		}
	}
});

export type Auth = typeof auth;
