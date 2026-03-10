import { json } from '@sveltejs/kit';
import { MongoClient } from 'mongodb';
import { DATABASE_URL } from '$env/static/private';
import type { RequestHandler } from './$types';

const client = new MongoClient(DATABASE_URL);

export const GET: RequestHandler = async ({ url }) => {
	const username = url.searchParams.get('username')?.trim().toLowerCase();
	const excludeUserId = url.searchParams.get('excludeUserId');

	if (!username || username.length < 3) {
		return json({ available: false, reason: 'Username must be at least 3 characters.' });
	}

	if (username.length > 20) {
		return json({ available: false, reason: 'Username must be 20 characters or fewer.' });
	}

	if (!/^[a-zA-Z0-9_]+$/.test(username)) {
		return json({ available: false, reason: 'Username can only contain letters, numbers, and underscores.' });
	}

	const db = client.db('treetag');
	const query: Record<string, any> = { username: { $regex: new RegExp(`^${username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } };

	if (excludeUserId) {
		const { ObjectId } = await import('mongodb');
		query._id = { $ne: new ObjectId(excludeUserId) };
	}

	const existing = await db.collection('user').findOne(query, { projection: { _id: 1 } });

	return json({ available: !existing });
};
