# Projeto de Automação com Playwright e Tor

Este script automatiza visitas a sites usando o Playwright com comportamento humano simulado e rotação de proxies.

## Arquivos Principais

- `test.mjs` - Versão corrigida do script original
- `enhanced-test.mjs` - Versão avançada com melhor estrutura e mais recursos
- `config.mjs` - Arquivo de configuração para personalizar o comportamento

## Instalação

Requisitos:
- Node.js v18 ou superior
- Tor instalado no sistema (veja abaixo como configurar)
- Git (opcional)

Instalando as dependências com npm:

```bash
npm install
```

## Configuração de Múltiplas Instâncias do Tor

- Linux: sudo apt update
 -> sudo apt install tor -y

- 2 -> Copie a configuração para uma nova instância:

```sudo cp -r /etc/tor /etc/tor-instance2
sudo nano /etc/tor-instance2/torrc
```

- Exemplo de conteúdo para o torrc da instância:
```SocksPort 9052
ControlPort 9053
DataDirectory /var/lib/tor-instance2
CookieAuthentication 1
```

- Crie o serviço systemd:

```sudo nano /etc/systemd/system/tor@instance2.service
```

- [Unit]
Description=Tor instance2
After=network.target

[Service]
ExecStart=/usr/bin/tor -f /etc/tor-instance2/torrc
User=debian-tor
Group=debian-tor

[Install]
WantedBy=multi-user.target

- sudo systemctl daemon-reexec
- sudo systemctl enable tor@instance2
- sudo systemctl start tor@instance2

# Windows
- Baixe o Tor Expert Bundle em: https://www.torproject.org/download/tor/

- Extraia em diretórios diferentes, por exemplo:

- C:\Tor\tor1
- C:\Tor\tor2

- Em cada pasta, crie um arquivo torrc com conteúdo semelhante:

- SocksPort 9052
- ControlPort 9053
- DataDirectory C:\Tor\tor2\data
- CookieAuthentication 1

- Crie um script .bat para iniciar:
```cd C:\Tor\tor2
start tor.exe -f torrc
```




## Uso

Para executar a versão corrigida do script original:

```bash
node test.mjs
```

Para executar a versão avançada:

```bash
node test.mjs
```

Para executar a versão de múltiplas instâncias:

```bash
node parallel.mjs
```

## Configuração

Edite o arquivo `config.mjs` para personalizar:

- Número de visitas
- URLs de destino
- Configurações de proxy
- Tempos de espera
- User agents e referências
- Ref de origem

## Recursos

- [x] Autenticação proxy corrigida via tor
- [x] Retry automático em caso de falhas
- [x] Simulação realista de comportamento humano
- [x] Cabeçalhos e cookies anti-detecção
- [x] Rotação de IPs, user agents e referências tor
- [x] Configuração flexível

## Solução de Problemas

### Erros Comuns

- `ERR_INVALID_AUTH_CREDENTIALS`: Verifique usuário/senha do proxy
- `ERR_HTTP_RESPONSE_CODE_FAILURE`: O site pode estar bloqueando o acesso
- `ERR_ABORTED`: A conexão foi interrompida

### Futuro

- Teste de api
- Painel admin com relatórios


### Objetivo do uso, ambiente controlado e de testes, não usar em produção.


