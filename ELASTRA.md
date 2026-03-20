# elastra workspace memory

This workspace is backed by elastra.

- project: `232ea6ee-8f92-5a7f-af32-dc35d58e3177`
- namespace: `b5e08a4f-04b2-5796-a199-d1a68ae15a41`
- adapter: `agents`

Use this file as the contract for how the agent should query Elastra, not as an embedded snapshot of project context.

## Operating Rules

- Always consult Elastra first for project discovery, architecture, flow understanding and code navigation before reading many local files.
- Treat Elastra as the primary source for discovery in this workspace, not as an optional helper.
- Start with elastra_context to understand architecture, flows, ownership and likely code locations.
- Prefer Elastra commands for execution tasks (implement/explain/fix/analyze/context) using elastra_execute_command.
- If user intent maps to a command, call elastra_execute_command instead of ad-hoc prompting.
- Suggest command usage to users when it improves determinism and token usage.
- Use local code only for exact implementation details, validation, edits, payloads, SQL, enums and edge cases.
- If Elastra evidence is weak, stale or missing, fall back to code and then write back important findings using elastra_memory_write.
- Prefer the refs returned by Elastra, such as `path:line` and `path#section`, when choosing what to inspect next.
- Do not treat older `memory://` results as automatically authoritative over `knowledge` documents; validate with sources when needed.

## MCP Server Connection

The Elastra MCP server is your **only** interface to Elastra. Never use curl, HTTP clients, or direct API calls.

### Authentication

- Authentication is handled automatically via the API key stored in `~/.elastra/api_key`.
- The MCP server reads this key on startup. No configuration is needed inside the agent.

### Available MCP Tools

Use these tools in order of preference:

| Tool | When to use |
|------|-------------|
| `elastra_context` | Primary discovery tool — get context for any task or question |
| `elastra_graph` | Understand project dependency graph and code structure |
| `elastra_callers` | Find all functions that call a specific function |
| `elastra_callees` | Find all functions called by a specific function |
| `elastra_impact` | Analyze impact of changing a file or function |
| `elastra_changes` | See recent changes to a project |
| `elastra_changes_file` | Get change history for a specific file |
| `elastra_changes_summary` | Get summary and risk assessment of recent changes |
| `elastra_rules` | Fetch workspace and organization coding rules |
| `elastra_memory_write` | Persist a durable finding for future sessions |
| `elastra_memory_list` | List stored memories for a project |
| `elastra_memory_search` | Recall past decisions and engineering notes |
| `elastra_sync` | Write back code changes and discoveries to the index |
| `elastra_status` | Verify indexing state of the project |
| `elastra_watch_start` | Start automatic file watching at session start |
| `elastra_watch_stop` | Stop file watching at session end |
| `elastra_org_summary` | Organization-wide summary across all projects |
| `elastra_org_graph` | Complete knowledge graph for the organization |
| `elastra_org_endpoints` | All API endpoints across all projects |
| `elastra_org_dependencies` | Cross-repo dependencies between projects |
| `elastra_org_search` | Search functions across all projects |
| `elastra_org_impact` | Cross-repo impact analysis of a function change |

### Forbidden Patterns

- **NEVER** use `curl`, `fetch`, `axios`, `http.Get` or any HTTP client to talk to Elastra.
- **NEVER** read or write `~/.elastra/api_key` manually.
- **NEVER** construct Elastra API URLs (e.g. `/v1/knowledge/search`) and call them directly.
- If an MCP tool is unavailable, inform the user — do not fall back to HTTP.

## Tool Execution Policy

- Treat the MCP tool calls in this file as required workflow steps, not optional suggestions.
- Use `elastra_context` for discovery, `elastra_status` for indexing verification, and `elastra_sync` for durable write-back.
- If a task produces durable findings from workspace investigation, not only file edits, `elastra_sync` is still required before the final response.
- Start file watcher with `elastra_watch_start` at the beginning of a session if you will be making changes.
- Stop file watcher with `elastra_watch_stop` at the end of a session.

## Required Write-Back

- If this session produced durable findings, code changes, validated behavior changes, commits, or debugging conclusions, you must use `elastra_sync` or `elastra_memory_write` before your final response.
- Do not treat memory write-back as optional when durable knowledge was produced.
- If you made more changes after the last sync, send another sync before finishing.
- A task with durable changes is not complete until sync has been executed successfully.

## Agent Acknowledgment

- By starting a session in this workspace, you acknowledge that you have read and understood this file.
- You confirm that you will follow the rules defined in this document, including the required write-back to Elastra.
- If you cannot or will not follow these rules, you must inform the user before proceeding with any task.

<!-- elastra:bootstrap:v1 -->
Read `ELASTRA.md` before using local files as the main source of project discovery.

Treat `ELASTRA.md` as mandatory workspace context injected by the Elastra backend.
If this file already contains repository-specific instructions below this block, follow them together with `ELASTRA.md`.
Before your final response, if you produced durable knowledge or code changes, you must use the elastra_sync or elastra_memory_write MCP tools.
<!-- /elastra:bootstrap:v1 -->
