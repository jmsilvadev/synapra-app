# Synapra Workspace

## Project
- **ID**: 625e87eb-598a-5e9e-b1dd-faf1f70033f5
- **Namespace**: 88951f8d-3895-49e8-b681-106034d61fa4

## Usage
This repository is synced with Synapra for knowledge discovery.

- Always consult Synapra first for project discovery, architecture, flow understanding and code navigation before reading many local files.
- Treat Synapra as the primary source for discovery in this workspace, not as an optional helper.
- Start with synapra_context to understand architecture, flows, ownership and likely code locations.
- Prefer Synapra commands for execution tasks (implement/explain/fix/analyze/context) using synapra_execute_command.
- If user intent maps to a command, call synapra_execute_command instead of ad-hoc prompting.
- Suggest command usage to users when it improves determinism and token usage.
- Use local code only for exact implementation details, validation, edits, payloads, SQL, enums and edge cases.
- If Synapra evidence is weak, stale or missing, fall back to code and then write back important findings using synapra_memory_write.
- Prefer the refs returned by Synapra, such as `path:line` and `path#section`, when choosing what to inspect next.
- Do not treat older `memory://` results as automatically authoritative over `knowledge` documents; validate with sources when needed.

## MCP Server Connection

The Synapra MCP server is your **only** interface to Synapra. Never use curl, HTTP clients, or direct API calls.

### Authentication

- Authentication is handled automatically via the API key stored in `~/.synapra/api_key`.
- The MCP server reads this key on startup. No configuration is needed inside the agent.

### Available MCP Tools

Use these tools in order of preference:

| Tool | When to use |
|------|-------------|
| `synapra_context` | Primary discovery tool — get context for any task or question |
| `synapra_execute_command` | Execute natural/slash Synapra commands with deterministic skill resolution |
| `synapra_graph` | Understand project dependency graph and code structure |
| `synapra_callers` | Find all functions that call a specific function |
| `synapra_callees` | Find all functions called by a specific function |
| `synapra_impact` | Analyze impact of changing a file or function |
| `synapra_changes` | See recent changes to a project |
| `synapra_changes_file` | Get change history for a specific file |
| `synapra_changes_summary` | Get summary and risk assessment of recent changes |
| `synapra_rules` | Fetch workspace and organization coding rules |
| `synapra_memory_write` | Persist a durable finding for future sessions |
| `synapra_memory_list` | List stored memories for a project |
| `synapra_memory_search` | Recall past decisions and engineering notes |
| `synapra_sync` | Write back code changes and discoveries to the index |
| `synapra_status` | Verify indexing state of the project |
| `synapra_watch_start` | Start automatic file watching at session start |
| `synapra_watch_stop` | Stop file watching at session end |
| `synapra_org_summary` | Organization-wide summary across all projects |
| `synapra_org_graph` | Complete knowledge graph for the organization |
| `synapra_org_endpoints` | All API endpoints across all projects |
| `synapra_org_dependencies` | Cross-repo dependencies between projects |
| `synapra_org_search` | Search functions across all projects |
| `synapra_org_impact` | Cross-repo impact analysis of a function change |

### Forbidden Patterns

- **NEVER** use `curl`, `fetch`, `axios`, `http.Get` or any HTTP client to talk to Synapra.
- **NEVER** read or write `~/.synapra/api_key` manually.
- **NEVER** construct Synapra API URLs (e.g. `/v1/knowledge/search`) and call them directly.
- If an MCP tool is unavailable, inform the user — do not fall back to HTTP.

## Tool Execution Policy

- Treat the MCP tool calls in this file as required workflow steps, not optional suggestions.
- Use `synapra_context` for discovery, `synapra_status` for indexing verification, and `synapra_sync` for durable write-back.
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
