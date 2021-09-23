import {getDb, getNewId} from '$lib/db';
import type {ServerLocals} from '$lib/systemtypes';
import type {CardDeckRevision, CardDeckSummary} from '$lib/types';
import type {EndpointOutput, Request} from '@sveltejs/kit';
import {cleanRevision} from "./[deckId]/revisions";

const debug = true;

export async function get(request: Request): Promise<EndpointOutput> {
	const locals = request.locals as ServerLocals;
	if (!locals.authenticated) {
		if (debug) console.log(`locals`, locals);
		return {status: 403}
	}
	if (debug) console.log(`get decks`);
	const db = await getDb();
	const decks = await db.collection<CardDeckSummary>('CardDeckSummaries').find({
		owners: locals.email
	}).toArray()
	if (debug) console.log(`decks for ${locals.email}`, decks);
	return {
		body: {
			decks: decks as any[]
		}
	}
}

export async function post(request: Request): Promise<EndpointOutput> {
	const locals = request.locals as ServerLocals;
	if (!locals.authenticated) {
		if (debug) console.log(`locals`, locals);
		return {status: 403}
	}
	let revision = request.body as unknown as CardDeckRevision;
	//if (debug) console.log(`add deck`, revision);
	const db = await getDb();
	// new deck id
	const deckId = getNewId();
	const revId = 1;
	await cleanRevision(db, revision, deckId, revId)
	const revResult = await db.collection<CardDeckRevision>('CardDeckRevisions').insertOne(revision)
	if (!revResult.insertedId) {
		console.log(`Error adding revision for new deck ${deckId}`);
		return {status: 500};
	}
	const deck: CardDeckSummary = {
		_id: deckId,
		name: revision.deckName,
		description: revision.deckDescription,
		isPublic: false,
		owners: [locals.email],
		currentRevision: revId,
		credits: revision.deckCredits,
	};
	// add deck
	const summaryResult = await db.collection<CardDeckSummary>('CardDeckSummaries').insertOne(deck)
	if (!summaryResult.insertedId) {
		console.log(`Error adding new deck ${deckId}`);
		return {status: 500};
	}
	console.log(`added deck ${deckId}`);

	return {
		body: {
			deckId: deckId,
			revId: revId
		}
	}
}
  
