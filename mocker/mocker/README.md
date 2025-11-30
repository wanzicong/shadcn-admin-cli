# Mocker API Server

 FastAPI  Mock API 
h: Shadcn Admin y API /

## = /

- **FastAPI** -  Python Web F
- **SQLAlchemy** - :' ORM F
- **SQLite** - {pn
- **Pydantic** - pn
- **JWT** - 
- **Poetry** - Python 

## = L

### 1. 

```bash
cd mocker
poetry install
```

### 2. pn

```bash
poetry run python -m mocker.seed
```

### 3. /

```bash
poetry run python -m mocker.run
```


( `http://localhost:9000` /

### 4.  API 

- **Swagger UI**: http://localhost:9000/docs
- **ReDoc**: http://localhost:9000/redoc
- **OpenAPI JSON**: http://localhost:9000/openapi.json

## = &

K&

| (7
 |  |  |  |
|--------|------|------|------|
| superadmin | admin123 | X | ; |
| zhangsan | user123 | X | ; |
| lisi | user123 |  | ; |
| wangwu | user123 | 6 | ^; |
| zhaoliu | user123 | 6 |  |
| qianqi | user123 | 6 | \ |

## = API 

### 

- `POST /api/auth/login` - (7{U
- `GET /api/auth/profile` - SM(7
- `POST /api/auth/logout` - (7{

### (7

- `GET /api/users/` - (7h/u"[		
- `GET /api/users/{user_id}` - U*(7
- `POST /api/users/` - (7
- `PUT /api/users/{user_id}` - (7
- `DELETE /api/users/{user_id}` -  dU*(7
- `DELETE /api/users/` - y d(7
- `POST /api/users/invite` - (7
- `POST /api/users/{user_id}/activate` - ;(7
- `POST /api/users/{user_id}/suspend` - (7
- `GET /api/users/stats/summary` - (7

### 

- `GET /api/tasks/` - h/u"[		
- `GET /api/tasks/{task_id}` - U*
- `POST /api/tasks/` - 
- `PUT /api/tasks/{task_id}` - o
- `DELETE /api/tasks/{task_id}` -  dU*
- `DELETE /api/tasks/` - y d
- `PUT /api/tasks/{task_id}/status` - 
- `PUT /api/tasks/{task_id}/assign` - M
- `POST /api/tasks/import` - ye
- `GET /api/tasks/export` - pn
- `GET /api/tasks/stats/summary` - o
- `GET /api/tasks/dashboard` - pn

## =' Mn

### 

( `.env` -Mn

```env
# pnn
DATABASE_URL=sqlite:///./mocker.db

# JWT Mn
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Mn
API_HOST=0.0.0.0
API_PORT=9000
DEBUG=True

# CORS Mn
ALLOWED_ORIGINS=http://localhost:3000
```

## < y

```
src/mocker/
 main.py              # FastAPI (e
 run.py               # (/,
 seed.py              # pnPpn
 database.py          # pnn
 models.py            # SQLAlchemy !
 schemas.py           # Pydantic !
 utils.py             # 
 routers/
     __init__.py
     auth.py          # 1
     users.py         # (71
     tasks.py         # 1
```

## = y'

- **JWT **:  token 
- ****: ( bcrypt 
- **CORS /**: Dn
- ****: Pydantic pn
- **SQL 2**: ORM 

## = pn!

### (7 (User)

```python
{
    "id": "string",              # UUID
    "firstName": "string",       # 
W
    "lastName": "string",        # 
    "username": "string",        # (7
/	
    "email": "string",           # /	
    "phoneNumber": "string",     # K:
    "status": "active|inactive|invited|suspended",
    "role": "superadmin|admin|manager|cashier",
    "createdAt": "datetime",
    "updatedAt": "datetime"
}
```

###  (Task)

```python
{
    "id": "string",              # TASK-XXXX <
    "title": "string",          # 
    "description": "string",     # 
    "status": "backlog|todo|in progress|done|canceled",
    "label": "bug|feature|documentation",
    "priority": "low|medium|high|critical",
    "assignee": "string",        # M(7ID
    "dueDate": "datetime",       # *b
    "createdAt": "datetime",
    "updatedAt": "datetime"
}
```

## =
 

### u

- `page`: u11	
- `page_size`: p101'100	

### "	

- `search`: "s."*W	
- `status`: [	
- `role/label/priority`: /~/H[	
- `assignee`: M[	

### 

- `sort_by`: WcreatedAt	
- `sort_order`: asc|descdesc	

## = <

### 

```json
{
    "code": 200,
    "message": "success",
    "success": true,
    "data": {},
    "total": 100,
    "page": 1,
    "pageSize": 10
}
```

### 

```json
{
    "detail": ""
}
```

## = !

!/(}

```bash
poetry run python -m mocker.run
```

( uvicorn

```bash
poetry run uvicorn mocker.run:app --reload --host 0.0.0.0 --port 9000
```

## = 

1. @	 API  JWT dU	
2. pn(!/
3.  `seed.py` :n
4. API v `/docs` 
5. / CRUD \
6. h

## > M

Mn

```typescript
// vite.config.ts Mn
proxy: {
  '/api': {
    target: 'http://localhost:9000',
    changeOrigin: true
  }
}
```



```env
VITE_API_BASE_URL=http://localhost:9000
```