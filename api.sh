ffuf -u https://api.cifraads.com/FUZZ \
  -w ~/custom-wordlist.txt \
  -mc 200,201,202,204,401,403 \
  -fc 404 \
  -t 10 \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxldHR2aTIwMTVAZ21haWwuY29tIiwic3ViIjozNjEsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ2NjQxMDg5LCJleHAiOjE3NDY2NDQ2ODl9.WC6rHhBA07GI_6WjNne5BBYLIaOoOabo9pZLg7C8A2g' \
  -o api-routes.json -of json
