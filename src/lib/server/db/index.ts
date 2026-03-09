import mongoose from 'mongoose';
import { DATABASE_URL } from '$env/static/private';

let isConnected = false;

export async function connectDB(): Promise<void> {
	if (isConnected) return;
	await mongoose.connect(DATABASE_URL, { dbName: 'treetag' });
	isConnected = true;
}
