#!/bin/bash

ENDPOINTS=(
  "/api/payments/359"
  "/api/payments/update/359"
  "/api/payments/359/update"
  "/api/payments/set-revenue/359"
  "/api/payments/setPublisherRevenue/359"
  "/api/payments/publisher-revenue/359"
  "/api/payments/adjust-revenue/359"
  "/api/admin/payments/359"
  "/api/admin/payments/update/359"
  "/api/backoffice/payments/359"
  "/admin-api/payments/359"
  "/admin/payments/359"
  "/v1/payments/359"
  "/v1/admin/payments/359"
  "/payments/set-revenue"
  "/payments/setPublisherRevenue"
)

METHODS=("PATCH" "PUT" "POST")

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxldHR2aTIwMTVAZ21haWwuY29tIiwic3ViIjozNjEsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ3MDUzNjY2LCJleHAiOjE3NDcwNTcyNjZ9.umLGtQ81Vej84F4Dpvyvm6cDCZB2UYzVJ_W5b9-SjeU"

for method in "${METHODS[@]}"; do
  for ep in "${ENDPOINTS[@]}"; do
    echo "Testando $method $ep"
    curl -s -o /dev/null -w "%{http_code} => $method $ep\n" -X $method "https://api.cifraads.com$ep" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"paymentId": 359, "publisherRevenue": "2798.62"}'
  done
done
