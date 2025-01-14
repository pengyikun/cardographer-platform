<script context="module" lang="ts">
	import {base} from '$app/paths'
	import type {Session} from "$lib/types";
	import {authenticateRequest, errorResponse} from "$lib/ui/token"
	import type {Load} from '@sveltejs/kit'

	export const load: Load = async function ({fetch, session}) {
		const res = await fetch(`${base}/api/user/sessions`, authenticateRequest(session))
		if (res.ok) {
			return {
				props: {
					sessions: (await res.json()).values.sort(compareSessions)
				}
			};
		}

		return errorResponse(res)
	}

	function compareSessions(a: Session, b: Session) {
		const aName = `${a.name} ${a.owners[0]} ${a.created}`
		const bName = `${b.name} ${b.owners[0]} ${b.created}`
		return String(aName).localeCompare(bName)
	}
</script>

<script lang="ts">
	import UploadButton from "$lib/ui/UploadButton.svelte"
	import UserTabs from '$lib/ui/UserTabs.svelte'
	import {session} from '$app/stores'

	export let sessions: Session[]
	let showArchived = false

	let working = false
	let error = ''
	let message = ''

	async function importSession(event: CustomEvent<FileList>) {
		const files = event.detail
		if (files.length == 0) {
			console.log(`no file`)
			return
		}
		error = message = '';
		working = true;
		const promises: Promise<string>[] = []

		Array.from(files).forEach((file) => {
			promises.push(file.text())
		})
		const fileJsons = await Promise.all(promises)
		const json = '[' + fileJsons.join(',') + ']'
		const res = await fetch(`${base}/api/user/sessions/import`, authenticateRequest($session, {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: json
		}));
		working = false
		if (res.ok) {
			const info = await res.json();
			message = info.message;
			if (info.sessions) {
				sessions = info.sessions
			}
			// redirect
			//goto(`sessions/${info.sessid}`);
			console.log(`imported`, info);
		} else {
			error = `Sorry, there was a problem (${res.statusText})`;
		}
	}
</script>

<UserTabs/>

<div class="w-full flex flex-col mb-4 text-sm font-medium p-6 gap-4">
	{#each sessions as session}
		{#if showArchived === session.isArchived}
			<a class="listItem flex-col" href="sessions/{session._id}">
				<div class="flex flex-row gap-1">
					<div class="font-semibold">{session.name}</div>
					{#if session.isPublic}
						<div class="chip">Public</div>
					{/if}
					{#if session.isTemplate}
						<div class="chip">Template</div>
					{/if}
					{#if session.isArchived}
						<div class="chip">Archived</div>
					{/if}
				</div>
				{#if session.description}
					<div class="text-sm font-light">{session.description}</div>
				{/if}
			</a>
		{/if}
	{:else}
		<div class="self-center">No Sessions Found</div>
	{/each}

	{#if error}
		<div class="message-error whitespace-pre-line">{error}</div>
	{/if}
	{#if message}
		<div class="message-success whitespace-pre-line">{message}</div>
	{/if}

	<div class="flex self-center justify-center">
		{#if sessions.some((session) => session.isArchived)}
			<label class="flex items-center ml-6 py-1">
				<input type="checkbox" class="hidden" bind:checked="{showArchived}">
				{#if showArchived}
					<span class="button mx-2">Hide Archived</span>
				{:else}
					<span class="button mx-2">Show Archived</span>
				{/if}
			</label>
		{/if}

		<a class="button mx-2 self-center" href="{base}/user/sessions/new">
			<img alt="" class="button-icon" src="{base}/icons/add.svg"/>New Session
		</a>

		<UploadButton class="button mx-2 self-center" multiple={true} on:upload={importSession}
		              types=".json,application/json">
			<img alt="" class="button-icon" src="{base}/icons/upload.svg"/>Upload Sessions
		</UploadButton>
	</div>
</div>