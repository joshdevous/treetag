import { MongoClient, ObjectId } from 'mongodb';
import { DATABASE_URL } from '$env/static/private';

const client = new MongoClient(DATABASE_URL);

export async function awardPoints(userId: string, amount: number): Promise<void> {
	if (!amount || !ObjectId.isValid(userId)) return;
	const db = client.db('treetag');
	await db.collection('user').updateOne(
		{ _id: new ObjectId(userId) },
		{ $inc: { points: amount } }
	);
}
