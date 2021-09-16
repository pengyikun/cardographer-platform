import {getDb, getNewId} from '$lib/db';
import type {ServerLocals} from '$lib/systemtypes';
import type {Analysis} from '$lib/types';
import type {EndpointOutput, Request} from '@sveltejs/kit';

const debug = true;

export async function get(request: Request): Promise<EndpointOutput> {
	const locals = request.locals as ServerLocals;
	if (!locals.authenticated) {
		if (debug) console.log(`locals`, locals);
		return {status: 403}
	}
	if (debug) console.log(`get analyses`);
	const db = await getDb();
	const analyses = await db.collection<Analysis>('Analyses').find({
		owners: locals.email
	}).toArray()
	// Project?
	if (debug) console.log(`${analyses.length} analyses for ${locals.email}`);
	return {
		body: {
			values: analyses as any
		}
	}
}

export async function post(request: Request): Promise<EndpointOutput> {
	const locals = request.locals as ServerLocals;
	if (!locals.authenticated) {
		if (debug) console.log(`locals`, locals);
		return {status: 403}
	}
	let an = request.body as unknown as Analysis;
	//if (debug) console.log(`add analysis`, analysis);
	const db = await getDb();
	// new analysis id
	const newid = getNewId();
	const now = new Date().toISOString();
	// sanitise
	const analysis: Analysis = {
		_id: newid,
		name: an.name || "Unnamed",
		description: an.description || "",
		credits: an.credits || "",
		created: now,
		lastModified: now,
		owners: [locals.email],
		isPublic: false,
		snapshots: [],
	};
	// add
	let result = await db.collection<Analysis>('Analyses').insertOne(analysis);
	if (!result.insertedId) {
		console.log(`Error adding new analysis ${newid}`);
		return {status: 500};
	}
	console.log(`added analysis ${newid}`);

	return {
		body: {
			analid: newid
		}
	}
}

