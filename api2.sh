#!/bin/bash

curl -X PATCH "https://api.cifraads.com/users/291" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxldHR2aTIwMTVAZ21haWwuY29tIiwic3ViIjozNjEsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ2NjQxMDg5LCJleHAiOjE3NDY2NDQ2ODl9.WC6rHhBA07GI_6WjNne5BBYLIaOoOabo9pZLg7C8A2g" \
  -H "Content-Type: application/json" \
  -d '{
    "adAverageEcpm": "5.52",
    "adRevenue": 120.289
  }'


  curl -X PATCH "https://api.cifraads.com/users/182" \
  -H "Authorization:Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxldHR2aTIwMTVAZ21haWwuY29tIiwic3ViIjozNjEsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ2NjQxMDg5LCJleHAiOjE3NDY2NDQ2ODl9.WC6rHhBA07GI_6WjNne5BBYLIaOoOabo9pZLg7C8A2g" \" \
  -H "Content-Type: application/json" \
  -d '{"percentage": "10.00"}'


curl -s "https://api.cifraads.com/daily-treatments/daily-treatment-report?utm_source=&start_date=2025-04-30&end_date=2025-05-07&minImpressions=0&minRevenue=0&limite=20&pagina=1" \
  -H "Authorization:Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxldHR2aTIwMTVAZ21haWwuY29tIiwic3ViIjozNjEsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ2NjQxMDg5LCJleHAiOjE3NDY2NDQ2ODl9.WC6rHhBA07GI_6WjNne5BBYLIaOoOabo9pZLg7C8A2g" \" \ | jq


curl -s "https://api.cifraads.com/daily-treatments/daily-treatment-report?start_date=2025-04-30&end_date=2025-05-07" \
  -H "Authorization:Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxldHR2aTIwMTVAZ21haWwuY29tIiwic3ViIjozNjEsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ2NjQxMDg5LCJleHAiOjE3NDY2NDQ2ODl9.WC6rHhBA07GI_6WjNne5BBYLIaOoOabo9pZLg7C8A2g" \" | jq '.[] | select(.cf_ads == 182)'
