<!-- synapra:bootstrap:v1 -->
# Synapra Bootstrap

Read SYNAPRA.md before using local files as the main source of project discovery.

Treat SYNAPRA.md as mandatory workspace context injected by the Synapra backend.
If this file already contains repository-specific instructions below this block, follow them together with SYNAPRA.md.
Before your final response, if you produced durable knowledge or code changes, you must execute POST /v1/knowledge/sync.
<!-- /synapra:bootstrap:v1 -->

# synapra workspace memory

This workspace is backed by synapra.

- project: `625e87eb-598a-5e9e-b1dd-faf1f70033f5`
- namespace: `88951f8d-3895-49e8-b681-106034d61fa4`
- adapter: `agents`

Use the sections below as the primary source of project discovery, proof and navigation.

## Operating Rules

- Always consult Synapra first for project discovery, architecture, flow understanding and code navigation before reading many local files.
- Treat Synapra as the primary source for discovery in this workspace, not as an optional helper.
- Start with Synapra search/rendered context to understand architecture, flows, ownership and likely code locations.
- Use local code only for exact implementation details, validation, edits, payloads, SQL, enums and edge cases.
- If Synapra evidence is weak, stale or missing, fall back to code and then write back important findings as memory.
- Prefer the refs returned by Synapra, such as path:line and path#section, when choosing what to inspect next.
- Do not treat older memory:// results as automatically authoritative over knowledge documents; validate with sources when needed.
