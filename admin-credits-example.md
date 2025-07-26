# Admin Credit Management

You can now add credits to any user by their email address using the admin API.

## Add Credits to User

**POST** `/api/admin/add-credits`

### Headers:
```
Content-Type: application/json
x-admin-key: 0f5db72a966a8d5f7ebae96c6a1e2cc574c2bf926c62dc4526bd43df1c0f42eb
```

### Body:
```json
{
  "email": "user@example.com",
  "credits": 10
}
```

### Example using curl:
```bash
curl -X POST https://your-domain.replit.app/api/admin/add-credits \
  -H "Content-Type: application/json" \
  -H "x-admin-key: 0f5db72a966a8d5f7ebae96c6a1e2cc574c2bf926c62dc4526bd43df1c0f42eb" \
  -d '{"email": "user@example.com", "credits": 10}'
```

### Alternative (admin key in body):
```json
{
  "email": "user@example.com", 
  "credits": 10,
  "adminKey": "0f5db72a966a8d5f7ebae96c6a1e2cc574c2bf926c62dc4526bd43df1c0f42eb"
}
```

## Get User Info

**GET** `/api/admin/user/:email`

### Headers:
```
x-admin-key: 0f5db72a966a8d5f7ebae96c6a1e2cc574c2bf926c62dc4526bd43df1c0f42eb
```

### Example:
```bash
curl https://your-domain.replit.app/api/admin/user/user@example.com \
  -H "x-admin-key: 0f5db72a966a8d5f7ebae96c6a1e2cc574c2bf926c62dc4526bd43df1c0f42eb"
```

## Security Notes
- Keep the admin key secure
- Only use HTTPS in production
- Admin key can be passed in header, body, or query parameter