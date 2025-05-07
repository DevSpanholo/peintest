#!/bin/bash

curl -X PATCH "https://api.cifraads.com/users/291" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxldHR2aTIwMTVAZ21haWwuY29tIiwic3ViIjozNjEsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ2NjQxMDg5LCJleHAiOjE3NDY2NDQ2ODl9.WC6rHhBA07GI_6WjNne5BBYLIaOoOabo9pZLg7C8A2g" \
  -H "Content-Type: application/json" \
  -d '{
    "adAverageEcpm": "5.52",
    "adRevenue": 120.289
  }'
