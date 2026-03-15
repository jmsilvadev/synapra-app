# Synapra Integration - GitHub Copilot

## Regras Obrigatórias

1. **Sempre leia SYNAPRA.md primeiro** - Contexto do workspace injetado pelo backend Synapra
2. **Consulte a API Synapra** via `POST /v1/knowledge/search` para descoberta do projeto ANTES de ler muitos arquivos locais
3. **Verifique o status** com `GET /v1/knowledge/status` se necessário
4. **Sincronize descobertas** com `POST /v1/knowledge/sync` ao produzir conhecimento durável

## API Synapra

- **API Key**: Armazenada em `~/.synapra/api_key`
- **Base URL**: http://localhost:8080

## Comandos

```bash
# Buscar contexto
curl -s -X POST "http://localhost:8080/v1/knowledge/search" \
  -H "X-API-Key: $(cat ~/.synapra/api_key)" \
  -H "Content-Type: application/json" \
  -d '{\"project_id\":\"synapra\",\"namespace\":\"workspace\",\"query\":\"sua pergunta\"}'
```

