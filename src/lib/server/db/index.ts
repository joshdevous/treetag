import mongoose from 'mongoose';
import { env } from '$env/dynamic/private';

let isConnected = false;

export async function connectDB(): Promise<void> {
	if (isConnected) return;
	await mongoose.connect(env.DATABASE_URL!, { dbName: 'treetag' });
	isConnected = true;
}
