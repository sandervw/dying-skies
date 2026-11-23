# Glossary

The ubiquitous language of Dying Skies, one line per term. Code, issues, and UI copy use these names. Add a new term here in the same PR that introduces it.

## The universe

- **Sky:** one world: static art plus falling stars, generated from a Seed.
- **Seed:** 32 bytes that fix a Sky's static art and its music readout.
- **Token:** a Seed written as unpadded base64url, about 43 characters; the form used in addresses and on the wire.
- **Root sky:** the fixed Sky at `/`, the origin of the universe.
- **Star:** a falling object that carries the Seed of the Sky it opens.
- **Constellation:** the connected dots in a Sky's static art.
- **Palette:** the colours a Sky gives its Stars.
- **Sky profile:** the Seed-derived settings shared by every Star in a Sky.
- **Accent:** the Palette's median colour, used for highlighted controls.

## Lifecycle

- **Issued:** handed to a browser by the backend in a Batch.
- **Batch:** one response of issued Stars, each a Seed and its Tag.
- **Tag:** the backend's proof that it issued a Seed; a Save needs it.
- **Saved:** kept by a User; the Sky appears in their Gallery.
- **Destroyed:** removed by its owner forever; a Destroyed Seed is never Saved again.
- **Died:** Issued and neither Saved nor Destroyed. The API and the site say `died`; the analytics marts name the same number `dead`.
- **Counter:** the site-wide tally of Saved, Destroyed, and Died Skies.
- **Gallery:** the page of a User's Saved Skies.

## Accounts

- **Session:** the anonymous identity a browser gets on its first Batch; it holds that browser's issuance count and is never deleted.
- **User:** an account with a username.
- **Login:** a User's link to one Session; logout or eviction deletes the Login.
- **Password rules:** the five conditions a signup password meets.
- **Riddle:** the question assigned at signup whose answer the password holds.

## Music

- **Instrument set:** the group of instrument sounds a Sky plays.
- **Mode:** the scale a Sky's notes come from.
- **Preset:** the tempo, density, and reverb a Sky plays with.
- **Readout:** the line under the title naming the Instrument set, Mode, and Preset.
- **Immersive mode:** the view that hides the title, Readout, and Counter and dims the controls.

## Project

- **Piece:** one of `frontend`, `backend`, `analytics`, `infra`.
- **Contract:** a document that fixes what one Piece offers another.
- **Mart:** a table dbt builds for the analytics site to read.
