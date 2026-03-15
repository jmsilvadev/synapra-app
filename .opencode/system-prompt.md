# Synapra Integration - OpenCode

## Regras Obrigatórias

1. **Sempre leia SYNAPRA.md primeiro** - Contexto do workspace injetado pelo backend Synapra
2. **Consulte a API Synapra** via `POST /v1/knowledge/search` para descoberta do projeto ANTES de ler muitos arquivos locais
3. **Verifique o status** com `GET /v1/knowledge/status` se necessário
4. **Sincronize descobertas** com `POST /v1/knowledge/sync` ao produzir conhecimento durável

