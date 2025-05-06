#!/bin/bash

API_BASE="https://api.cifradobem.com"
WORDLIST="endpoints.txt"  # Arquivo com possíveis caminhos, um por linha
STATUS_CODES="200 401 403"

echo "Procurando endpoints na API: $API_BASE"
echo "-------------------------------------"

while read -r endpoint; do
    full_url="${API_BASE}/${endpoint}"
    response=$(curl -s -o /dev/null -w "%{http_code}" "$full_url")

    if [[ $STATUS_CODES =~ $response ]]; then
        echo "[+] Possível endpoint encontrado: $full_url (Status: $response)"
    fi
done < "$WORDLIST"
