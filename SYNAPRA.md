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
- Follow `navigate_to` refs like `path:line` and `anchor_ref` refs like `path#section` before asking for more code reading.
- If search returns weak or empty evidence, call `GET /v1/knowledge/status` for the same `project` and `namespace` before assuming Synapra has no data.
- If the client produced durable new workspace knowledge that should be shared with other agents, send it to `POST /v1/knowledge/sync`.
- Effective visibility is scoped by the authenticated API key and organization, not only by `project` and `namespace`.

