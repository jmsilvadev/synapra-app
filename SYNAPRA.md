# synapra workspace memory

- project: `synapra`
- namespace: `workspace`
- adapter: `agents`
- api_url: `http://localhost:8080`

Use this file as the contract for how the agent should query Synapra, not as an embedded snapshot of project context.

## Operating Rules

- Always consult Synapra first for project discovery, architecture, flow understanding and code navigation before reading many local files.
- Treat Synapra as the primary source for discovery in this workspace, not as an optional helper.
- Start with Synapra API search to understand architecture, flows, ownership and likely code locations.
- Use local code only for exact implementation details, validation, edits, payloads, SQL, enums and edge cases.
- If Synapra evidence is weak, stale or missing, fall back to code and then write back important findings as memory.
- Prefer the refs returned by Synapra, such as `path:line` and `path#section`, when choosing what to inspect next.
- Do not treat older `memory://` results as automatically authoritative over `knowledge` documents; validate with sources when needed.

## How To Use Synapra

- Use `POST /v1/knowledge/search` on `api_url` as the default discovery step before opening many local files.
- Query with the `project` and `namespace` declared in this file, authenticated with the current client's API key.
- When calling Synapra via HTTP (for example with `curl`), always send a JSON payload that includes `project_id`, `namespace` and `adapter` matching this workspace:
  -d '{"project_id":"synapra","namespace":"workspace","adapter":"agents"}'
- Follow `navigate_to` refs like `path:line` and `anchor_ref` refs like `path#section` before asking for more code reading.
- If search returns weak or empty evidence, call `GET /v1/knowledge/status` for the same `project` and `namespace` before assuming Synapra has no data.
- Effective visibility is scoped by the authenticated API key and organization, not only by `project` and `namespace`.

## Synapra API Key

- All requests to the Synapra API must be authenticated with an API key using the `X-API-Key` header or an `Authorization: Bearer` token.
- Read the API key from `~/.synapra/api_key`

## Endpoint Execution Policy

- Treat the endpoint calls in this file as required workflow steps, not optional suggestions.
- Use `POST /v1/knowledge/search` for discovery, `GET /v1/knowledge/status` for indexing verification, and `POST /v1/knowledge/sync` for durable write-back.
- If a task produces durable findings from workspace investigation, not only file edits, `POST /v1/knowledge/sync` is still required before the final response.
- This file defines what Synapra API calls must be made; it does not grant shell or network permissions inside the execution sandbox.
- If the environment requires approval for `curl` or similar commands, obtain that approval and then execute the required Synapra endpoint call rather than skipping it.

## Required Write-Back

- If this session produced durable findings, code changes, validated behavior changes, commits, or debugging conclusions, you must send a concise summary to `POST /v1/knowledge/sync` before your final response.
- Do not treat `knowledge/sync` as optional when durable knowledge was produced.
- If you made more changes after the last `knowledge/sync`, send another `knowledge/sync` before finishing.
- A task with durable changes is not complete until `knowledge/sync` has been executed successfully.

