# Synapra Integration - Claude Code

> Este arquivo é carregado no início de TODA sessão.

## Regras Obrigatórias

1. **Sempre leia SYNAPRA.md primeiro** - Contexto do workspace injetado pelo backend Synapra
2. **Consulte a API Synapra** via `POST /v1/knowledge/search` para descoberta do projeto ANTES de ler muitos arquivos locais
3. **Verifique o status** com `GET /v1/knowledge/status` se necessário
4. **Sincronize descobertas** com `POST /v1/knowledge/sync` ao produzir conhecimento durável

## API Synapra

- **API Key**: Armazenada em `~/.synapra/api_key`
- **Base URL**: http://localhost:8080

## Comandos Úteis

```bash
# Buscar contexto do projeto
curl -s -X POST "http://localhost:8080/v1/knowledge/search" \
  -H "X-API-Key: $(cat ~/.synapra/api_key)" \
  -H "Content-Type: application/json" \
  -d '{\"project_id\":\"synapra\",\"namespace\":\"workspace\",\"query\":\"sua pergunta\"}'

# Verificar status de indexação
curl -s "http://localhost:8080/v1/knowledge/status?project_id=synapra&namespace=workspace" \
  -H "X-API-Key: $(cat ~/.synapra/api_key)"
```

