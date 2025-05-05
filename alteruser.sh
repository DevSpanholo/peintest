curl -X PATCH "https://api.cifraads.com/users/361" \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxldHR2aTIwMTVAZ21haWwuY29tIiwic3ViIjozNjEsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQ2MDY4MDE1LCJleHAiOjE3NDYwNzE2MTV9.XYs7fDz2lNjdW83l0LRM6Wlw5Pf_qLJ9YIxZwxT7uKc' \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}' 