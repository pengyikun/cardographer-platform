import {getDb} from '$lib/db';
import type {ServerLocals} from '$lib/systemtypes';
import type {CardDeckRevision, CardDeckSummary} from '$lib/types';
import type {EndpointOutput, Request} from '@sveltejs/kit';

const debug = true;

export async function get(request: Request): Promise<EndpointOutput> {
	const locals = request.locals as ServerLocals;
	if (!locals.authenticated) {
		if (debug) console.log(`locals`, locals);
		return {status: 401}
	}
	const {deckId, revisionId} = request.params;
	if (debug) console.log(`get revision ${revisionId} for ${deckId}`);
	const db = await getDb();
	// permission check
	const deck = await db.collection<CardDeckSummary>('CardDeckSummaries').findOne({
		_id: deckId, owners: locals.email
	})
	if (!deck) {
		if (debug) console.log(`deck ${deckId} not found for ${locals.email}`);
		return {status: 404};
	}
	// project to summary
	const revision = await db.collection<CardDeckRevision>('CardDeckRevisions').findOne({
		deckId: deckId, revision: Number(revisionId)
	})
	if (!revision) {
		if (debug) console.log(`revision ${revisionId} not found for deck ${deckId}`);
		return {status: 404};
	}
	revision.isCurrent = revision.revision == deck.currentRevision;
	return {
		body: revision as any
	}
}

export async function put(request: Request): Promise<EndpointOutput> {
	const locals = request.locals as ServerLocals;
	if (!locals.authenticated) {
		if (debug) console.log(`locals`, locals);
		return {status: 401}
	}
	const revision = request.body as unknown as CardDeckRevision;
	const {deckId, revisionId} = request.params;
	if (deckId != revision.deckId || revisionId != String(revision.revision)) {
		if (debug) console.log(`revision doesnt match url`, revision);
		return {status: 400};
	}
	if (debug) console.log(`get revision ${revisionId} for ${deckId}`);
	const db = await getDb();
	// permission check
	const deck = await db.collection<CardDeckSummary>('CardDeckSummaries').findOne({
		_id: deckId, owners: locals.email
	})
	if (!deck) {
		if (debug) console.log(`deck ${deckId} not found for ${locals.email}`);
		return {status: 404};
	}
	// update revision
	const now = new Date().toISOString();
	const upd = await db.collection<CardDeckRevision>('CardDeckRevisions').updateOne({
		deckId: deckId, revision: Number(revisionId)
	}, {
		$set: {
			// project changes
			slug: revision.slug,
			deckName: revision.deckName,
			deckDescription: revision.deckDescription,
			deckCredits: revision.deckCredits,
			lastModified: now,
			revisionName: revision.revisionName,
			revisionDescription: revision.revisionDescription,
			isUsable: revision.isUsable,
			isPublic: revision.isPublic,
			isLocked: revision.isLocked,
			isTemplate: revision.isTemplate,
			// others should get set in other ways
		}
	});
	if (!upd.matchedCount) {
		if (debug) console.log(`revision ${revisionId} not matched for deck ${deckId}`, upd);
		return {status: 404};
	}
	// update deck summary
	const upd2 = await db.collection<CardDeckSummary>('CardDeckSummaries').updateOne({
		_id: deckId
	}, {
		$set: {
			name: revision.deckName,
			description: revision.deckDescription,
			credits: revision.deckCredits,
		}
	});
	if (!upd2.matchedCount) {
		if (debug) console.log(`deck ${deckId} update failed`, upd);
	}
	return {
		body: {}
	}
}
  