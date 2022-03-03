import {makeTokenCookie} from '$lib/security';
import type {RequestHandler} from '@sveltejs/kit';

export const post: RequestHandler = async function () {
	console.log(`logout`);
	// as cookie (for now)
	return {
		status: 200,
		headers: {
			'set-cookie': makeTokenCookie('')
		},
		body: {}
	}
}
