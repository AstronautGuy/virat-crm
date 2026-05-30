# Phase 45: Sales Entry & Customer Selection Upgrades - Context

## Domain
Upgrading the Sales entry UI to support Order IDs, auto-incrementing Invoice IDs, and an integrated Customer Master searchable dropdown.

## Decisions
- **Invoice ID Format**: The user wants the Invoice ID to be customer-entered (editable), but it should auto-increment by parsing the last saved invoice ID's numeric suffix and adding 1.
- **Duplicate Order IDs**: Hard block. If a manually entered Order ID already exists in the system, the submission will be rejected with an error.

## Canonical Refs
- ROADMAP.md
- PROJECT.md
- REQUIREMENTS.md

## Deferred Ideas
- None
