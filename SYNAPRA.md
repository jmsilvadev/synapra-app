# Synapra Workspace

Use this file as the contract for how the agent should query Synapra, not as an embedded snapshot of project context.

## Operating Rules

- Always consult Synapra first for project discovery, architecture, flow understanding and code navigation before reading many local files.
- Treat Synapra as the primary source for discovery in this workspace, not as an optional helper.
- Start with synapra_search to understand architecture, flows, ownership and likely code locations.
- Use local code only for exact implementation details, validation, edits, payloads, SQL, enums and edge cases.
- If Synapra evidence is weak, stale or missing, fall back to code and then write back important findings using synapra_memory_write.
- Prefer the refs returned by Synapra, such as `path:line` and `path#section`, when choosing what to inspect next.
- Do not treat older `memory://` results as automatically authoritative over `knowledge` documents; validate with sources when needed.

## MCP Server Connection

- The Synapra MCP server must be configured in your MCP client (Claude Desktop, etc.).
- The MCP server handles authentication automatically using the API key stored in `~/.synapra/api_key`.
- No manual HTTP calls or curl commands are needed.

## Tool Execution Policy

- Treat the MCP tool calls in this file as required workflow steps, not optional suggestions.
- Use `synapra_search` for discovery, `synapra_status` for indexing verification, and `synapra_sync` for durable write-back.
- If a task produces durable findings from workspace investigation, not only file edits, `synapra_sync` is still required before the final response.
- Start file watcher with `synapra_watch_start` at the beginning of a session if you will be making changes.
- Stop file watcher with `synapra_watch_stop` at the end of a session.

## Required Write-Back

- If this session produced durable findings, code changes, validated behavior changes, commits, or debugging conclusions, you must use `synapra_sync` or `synapra_memory_write` before your final response.
- Do not treat memory write-back as optional when durable knowledge was produced.
- If you made more changes after the last sync, send another sync before finishing.
- A task with durable changes is not complete until sync has been executed successfully.

## Agent Acknowledgment

- By starting a session in this workspace, you acknowledge that you have read and understood this file.
- You confirm that you will follow the rules defined in this document, including the required write-back to Synapra.
- If you cannot or will not follow these rules, you must inform the user before proceeding with any task.
