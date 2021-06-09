// extra API types, e.g. messages
import type { CardInfo, AtlasInfo } from '$lib/types.ts';

export interface LoginRequest {
	email: string;
	password: string;
	register: boolean;
	code?: string;
}
export interface LoginResponse {
	token?: string;
	error?: string;
}
export interface PostDeckResponse {
	deckId: string;
	revision: number;
}
export interface PostRevisionResponse {
	revision: number;
}

export interface PutCardsRequest {
	addColumns: boolean;
	csvFile: string;
}

export interface BuildResponse {
	messages: string[];
	error?: string;
	cards?: CardInfo[];
	atlases?: AtlasInfo[];
}

export interface PostUserDecksResponse {
	deckid: string;
	revid: number;
}
export interface PostUserRevisionResponse {
	revid: number;
}
export interface FileInfo {
	name: string;
	isDirectory: boolean;
	relPath?: string; // internal?
}
export interface UploadFile {
	name: string;
	//	isDirectory: boolean;
	content: string; // base64
}
export interface PostFilesRequest {
	files: UploadFile[];
}

// Unity client DeckInfo, subject to change (2021-05-25)
export interface DeckInfo {
	name: string;
	atlasCount: number; // same as atlas length?
	atlasURLs: string[];
	cardCount: number; // including back?
	cardX: number;
	cardY: number;
	cardInfo: string[]; // per card
}

export interface CopySessionRequest {
	sessid: string;
}
export interface CopySessionResponse {
	sessid: string;
}

