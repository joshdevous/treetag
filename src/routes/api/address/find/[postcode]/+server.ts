import { json } from '@sveltejs/kit';
import { PUBLIC_ADDRESS_LOOKUP_API_URL } from '$env/static/public';
import type { RequestHandler } from './$types';

function getBaseUrl(): string {
	const base = PUBLIC_ADDRESS_LOOKUP_API_URL?.trim();
	if (!base) throw new Error('Address lookup API URL is not configured.');
	return base.replace(/\/+$/, '');
}

export const GET: RequestHandler = async ({ params }) => {
	const postcode = params.postcode?.trim();
	if (!postcode) return json([], { status: 200 });

	try {
		const url = `${getBaseUrl()}/find/${encodeURIComponent(postcode)}`;
		const response = await fetch(url);
		if (!response.ok) return json([], { status: response.status });
		const payload = await response.json();
		return json(payload);
	} catch {
		return json([], { status: 200 });
	}
};
