<script lang="ts">
	import {page, session} from '$app/stores';
	import type {PostFilesRequest} from '$lib/apitypes';
	import {base} from '$app/paths';
	import type {CardDeckRevision} from '$lib/type';
	import {authenticateRequest} from "$lib/ui/token";
	import {createEventDispatcher} from 'svelte';
	import {toBase64} from "./download";

	export let revision: CardDeckRevision;

	const dispatch = createEventDispatcher();

	let working = false;
	let error = '';
	let message = '';
	let files: FileList
	let input: HTMLInputElement

	async function handleSubmit() {
		if (files.length == 0) {
			console.log(`no file`);
			return;
		}
		//console.log(`submit`, files);
		message = '';
		error = '';

		working = true;
		const {deckId, revisionId, file} = $page.params;
		let req: PostFilesRequest = {
			files: []
		}
		for (let fi = 0; fi < files.length; fi++) {
			const file = files[fi];

			const content = await toBase64(file);
			//console.log(`ready file ${file.name}`, content);
			req.files.push({
				name: file.name,
				content: content
			});
		}
		const url = `${base}/api/user/decks/${deckId}/${revisionId}/files${file.length == 0 ? '' : '/' + file}`;
		//console.log(`upload to ${url}`);
		const res = await fetch(url, authenticateRequest($session, {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify(req)
		}));
		//console.log(`done`, res);
		working = false;
		if (res.ok) {
			//message = "Uploaded";
			dispatch('finished', await res.json());
		} else {
			error = `Sorry, there was a problem (${res.statusText})`;
		}
	}

</script>

<input class="hidden" required id="file" type="file" bind:files bind:this={input} accept="*" multiple
       on:change={handleSubmit}/>

{#if error}
	<div class="message-error">{error}</div>
{/if}
{#if message}
	<div class="message-success">{message}</div>
{/if}

<button class="button button-slim" disabled={working || revision?.isLocked} on:click={() => {input.click()}}>
	<img src="{base}/icons/upload.svg" class="button-icon" alt=""/>
	Upload Files
</button>

