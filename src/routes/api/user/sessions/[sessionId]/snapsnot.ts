import {getClient, guessSessionType} from "$lib/clients"
import {getDb, getNewId} from "$lib/db"
import {isNotAuthenticated} from "$lib/security"
import type {Session, SessionSnapshot} from "$lib/types"
import type {EndpointOutput, RequestEvent} from "@sveltejs/kit"

export async function put({locals, params, request}: RequestEvent): Promise<EndpointOutput> {
	const input = await request.json()
	if(!input.url || !input.snapshot) {
		return {status: 400}
	}
	if (isNotAuthenticated(locals)) {
		return {status: 401}
	}
	const {sessionId} = params;
	const db = await getDb();
	// permission check
	const session = await db.collection<Session>('Sessions').findOne({
		_id: sessionId, owners: locals.email
	})
	if (!session) {
		return {status: 404};
	}
	const sessionType = guessSessionType(input.snapshot);
	if (!sessionType) {
		console.log(`no sessionType guess for import ${session._id}`);
		return {status: 400}
	}
	console.log(`SessionType: ${sessionType}`);
	const client = getClient(sessionType);
	const snapshot = client.makeSessionSnapshot(input.snapshot);
	const snapshotId = getNewId();
	snapshot.sessionId = sessionId;
	snapshot._id = snapshotId;

	await db.collection<SessionSnapshot>('SessionSnapshots').deleteMany({sessionId: sessionId})

	const r2 = await db.collection<SessionSnapshot>('SessionSnapshots').insertOne(snapshot);
	if (!r2.insertedId) {
		console.log(`Error adding new imported snapshot`);
		return {status: 500}
	}

	// session already imported?
	session.sessionType = sessionType
	session.url = input.url
	session.lastModified = new Date().toISOString()
	const upd = await db.collection<Session>('Sessions').updateOne({
		_id: sessionId
	}, {
		$set: {
			// project changes
			lastModified: session.lastModified,
			sessionType: session.sessionType,
			url: session.url
		}
	});
	if (!upd.matchedCount) {
		return {status: 404};
	}
	
	return {
		body: {
			session: session as any
		}
	}
}

