# Gestão de Clientes

Sistema de cadastro de clientes com banco SQLite, separado em módulos,
com log de auditoria e API REST opcional via FastAPI.

## Estrutura

```
projeto/
 ├── main.py          # Menu de terminal (interface)
 ├── api.py           # API REST com FastAPI
 ├── database.py      # Conexão SQLite + criação das tabelas
 ├── clientes.py      # CRUD direto no banco
 ├── services.py      # Regras de negócio + log de auditoria
 ├── validators.py    # Validação de nome / telefone / e-mail
 └── requirements.txt
```

## Usar pelo terminal

```bash
python main.py
```

## Usar pela API

```bash
pip install -r requirements.txt
uvicorn api:app --reload
```

Acesse `http://localhost:8000/docs` para a documentação interativa (Swagger UI).

### Endpoints disponíveis

| Método | Rota                  | Descrição                  |
|--------|-----------------------|----------------------------|
| GET    | /clientes             | Lista todos os clientes     |
| GET    | /clientes/{id}        | Busca por ID                |
| GET    | /buscar?q=termo       | Busca parcial por nome      |
| POST   | /clientes             | Cria novo cliente           |
| PUT    | /clientes/{id}        | Atualiza cliente            |
| DELETE | /clientes/{id}        | Remove cliente              |
| GET    | /logs                 | Logs de auditoria           |

### Exemplo de criação via curl

```bash
curl -X POST http://localhost:8000/clientes \
  -H "Content-Type: application/json" \
  -d '{"nome": "Fulano Silva", "telefone": "11912345678", "email": "fulano@email.com"}'
```