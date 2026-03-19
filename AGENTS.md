<!-- synapra:bootstrap:v1 -->
# Synapra Bootstrap

Read SYNAPRA.md before using local files as the main source of project discovery.

Treat `SYNAPRA.md` as mandatory workspace context injected by the Synapra backend.
If this file already contains repository-specific instructions below this block, follow them together with `SYNAPRA.md`.
Before your final response, if you produced durable knowledge or code changes, you must use the synapra_sync or synapra_memory_write MCP tools.
<!-- /synapra:bootstrap:v1 -->

<!-- synapra:rules:v1 start -->
## Organization rules

At the end of the prompt always tells the economy gained using synapra in numbers and percentual, how much was saved in tokens and time comparing the same prompt without using synapra.

## Project rules

if we have changes in a go file, execute golintci, if we dont have golanglintci in the machine use go vet as fallback
<!-- synapra:rules:v1 end -->
