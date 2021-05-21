# Cardographer API

## User 

Note, user API methods typically require authentication with
a JWT bearer token in the Authorization header. 
Currently this is generated by the server via `api/user/login`, 
and must include `email`.

### Card authoring

Authentication (placeholder):

- [x] `api/user/login` POST LoginRequest -> LoginResponse 
  (should change to OAuth or OpenID Connect at some point).
  Note, also sets the cookie used for browser access control.
- [x] `api/user/logout` POST () -> (). 

Deck authoring:

- [x] `api/user/decks.json` GET (auth. JWT email) -> 
  {decks:CardDeckSummary[]} with email in owners.
- [x] `api/user/decks/[deckid]/revisions.json` GET (auth. JWT email) ->
  {revisions:CardDeckRevisionSummary[],deck:CardDeckSummary} 
- [x] `api/user/decks/[deckid]/revisions/[revid].json` GET (auth. JWT email
  or revision isPublic) -> CardDeckRevision
- [x] `api/user/decks` POST CardDeckRevision (auth) -> {deckid,revid=1}
- [x] `api/user/decks/[deckid]/revisions` POST CardDeckRevision (auth.)
  -> {revid}
- [ ] `api/user/decks/[deckid]` POST CardDeckSummary {owners, isPublic}
  (auth.) -> ()
- [x] `api/user/decks/[deckid]/revisions/[revid]` POST CardDeckRevision
  (auth.) -> ()
- [x] `api/user/decks/[deckid]/revisions/[revid]/cards.csv` GET 
  ?allColumns&withRowTypes (auth) -> .CSV file of card metadata
- [x] `api/user/decks/[deckid]/revisions/[revid]/cards` PUT (auth.) 
  PutCardsRequest {addColumns, .CSV file of card metadata} -> 
  () or CardDeckRevision?
- [x] `api/user/decks/[deckid]/revisions/[revid]/build` POST (auth.)
  () -> BuildResponse

Files (TBC):

- [.] `api/user/decks/[deckid]/revisions/[revid]/files/[...file]` GET 
  (auth) -> file info [] or file content
- [ ] `api/user/decks/[deckid]/revisions/[revid]/files/[...file]` 
  PUT (auth) file content -> ()
- [ ] `api/user/decks/[deckid]/revisions/[revid]/files/[...file]`       
  POST (auth) file info -> mkdir
- [ ] `api/user/decks/[deckid]/revisions/[revid]/files/[...file]`
  DELETE (auth) -> ()

Public decks & templates:
- [x] `api/public/templates.json` GET -> 
  {values:CardDeckRevisionSummary[]} with isPublic & isTemplate
- [ ] `api/public/decks.json` GET -> CardDeckSummary[] with isPublic
- [ ] `api/public/decks/[deckid]/revisions.json` GET ->
  CardDeckRevisionSummary[] (if deck isPublic and revision isPublic)
- [x] `api/public/decks/[deckid]/revisions/[revid].json` GET 
  (revision isPublic) -> CardDeckRevision

Deck use:
- [ ] `api/client/decks/[deckid]/revisions/[revid].json` GET (auth
  or isPublic) -> subset? of CardDeckRevision
- [ ] `api/client/decks/[deckid]/revisions/[revid]/outputfiles/[filename]`
  GET (auth or isPublic) -> file content

Images:
- [x] `api/cards/images/[deckid]/[revid]/[...file]` GET -> file
  from _output (only application/octet-stream atm - sveltekit issue)

## Sessions

To do
 