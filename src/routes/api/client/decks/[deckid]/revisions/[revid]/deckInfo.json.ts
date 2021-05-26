import {getDb} from '$lib/db.ts';
import type {CardDeckSummary,CardDeckRevision} 
  from '$lib/types.ts';
import type {RequestHandler} from '@sveltejs/kit';
import type {ServerLocals} from '$lib/systemtypes.ts';

const debug = true;

export async function get(request): RequestHandler {
	const {deckid,revid} = request.params;
	const db = await getDb();
	const revision = await db.collection('CardDeckRevisions').findOne({
		deckId: deckid, revision: Number(revid)
	}) as CardDeckRevision;
	if (!revision) {
		if (debug) console.log(`revision ${revid} not found for deck ${deckid}`);
		return { status: 404 };
	}
	if (!revision.isPublic) {
		// permission check
		const locals = request.locals as ServerLocals;
		if (!locals.authenticated) {
			return { status: 403 }
		}
		const deck = await db.collection('CardDeckSummaries').findOne({
			_id: deckid, owners: locals.email 
		}) as CardDeckSummary;
		if (!deck) {
			if (debug) console.log(`deck ${deckid} not found for ${locals.email}`);
			return { status: 404 };
		}
	}
	if (revision.output?.atlases && revision.output.atlases.length>0) {
		return {
			body: revision.output.atlases
		}
	}
	else {
		if (debug) console.log(`no output atlases for ${deckid} ${revid}`);
		return { body: [] }
	}
}
  
