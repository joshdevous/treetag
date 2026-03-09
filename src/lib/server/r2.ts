import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import {
	R2_ACCOUNT_ID,
	R2_ACCESS_KEY_ID,
	R2_SECRET_ACCESS_KEY,
	R2_BUCKET_NAME,
	R2_PUBLIC_URL
} from '$env/static/private';
import crypto from 'crypto';

const s3 = new S3Client({
	region: 'auto',
	endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: R2_ACCESS_KEY_ID,
		secretAccessKey: R2_SECRET_ACCESS_KEY
	}
});

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function uploadPhoto(
	file: File,
	folder = 'trees'
): Promise<{ url: string; key: string }> {
	if (!ALLOWED_TYPES.includes(file.type)) {
		throw new Error('Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.');
	}
	if (file.size > MAX_SIZE_BYTES) {
		throw new Error('File too large. Maximum size is 10 MB.');
	}

	const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
	const key = `${folder}/${crypto.randomUUID()}.${ext}`;
	const buffer = Buffer.from(await file.arrayBuffer());

	await s3.send(
		new PutObjectCommand({
			Bucket: R2_BUCKET_NAME,
			Key: key,
			Body: buffer,
			ContentType: file.type
		})
	);

	return {
		url: `${R2_PUBLIC_URL}/${key}`,
		key
	};
}

export async function deletePhoto(key: string): Promise<void> {
	await s3.send(
		new DeleteObjectCommand({
			Bucket: R2_BUCKET_NAME,
			Key: key
		})
	);
}
