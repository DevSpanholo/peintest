# Site Visitor Script

Este script automatiza visitas a sites usando o Playwright com comportamento humano simulado e rotação de proxies.

## Arquivos Principais

- `test.mjs` - Versão corrigida do script original
- `enhanced-test.mjs` - Versão avançada com melhor estrutura e mais recursos
- `config.mjs` - Arquivo de configuração para personalizar o comportamento

## Instalação

```bash
npm install
```

## Uso

Para executar a versão corrigida do script original:

```bash
node test.mjs
```

Para executar a versão avançada:

```bash
node enhanced-test.mjs
```

## Configuração

Edite o arquivo `config.mjs` para personalizar:

- Número de visitas
- URLs de destino
- Configurações de proxy
- Tempos de espera
- User agents e referências

## Recursos

- ✅ Autenticação proxy corrigida
- ✅ Retry automático em caso de falhas
- ✅ Simulação realista de comportamento humano
- ✅ Cabeçalhos e cookies anti-detecção
- ✅ Rotação de IPs, user agents e referências
- ✅ Configuração flexível

## Solução de Problemas

### Erros Comuns

- `ERR_INVALID_AUTH_CREDENTIALS`: Verifique usuário/senha do proxy
- `ERR_HTTP_RESPONSE_CODE_FAILURE`: O site pode estar bloqueando o acesso
- `ERR_ABORTED`: A conexão foi interrompida

### Dicas

1. Aumente os tempos de espera para sites mais lentos
2. Reduza o número de visitas simultâneas
3. Use um conjunto maior de proxies rotativos
4. Verifique se o proxy é compatível com o site alvo