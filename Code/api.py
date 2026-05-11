"""
api.py — backend FastAPI.

Instalar dependências:
    pip install fastapi uvicorn

Rodar:
    uvicorn api:app --reload
"""

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, EmailStr, field_validator
import re

from database import inicializar_banco
import clientes as db
import services as svc

# ── inicialização ─────────────────────────────────────────────────────────

inicializar_banco()
app = FastAPI(
    title="Gestão de Clientes",
    description="API REST para cadastro e consulta de clientes.",
    version="1.0.0",
)


# ── schemas ───────────────────────────────────────────────────────────────

class ClienteIn(BaseModel):
    nome: str
    telefone: str
    email: EmailStr

    @field_validator("nome")
    @classmethod
    def nome_valido(cls, v):
        v = v.strip()
        if len(v) < 2:
            raise ValueError("O nome deve ter pelo menos 2 caracteres.")
        if not re.match(r"^[A-Za-zÀ-ÿ\s]+$", v):
            raise ValueError("O nome deve conter apenas letras e espaços.")
        return v

    @field_validator("telefone")
    @classmethod
    def telefone_valido(cls, v):
        digitos = re.sub(r"\D", "", v)
        if not (10 <= len(digitos) <= 13):
            raise ValueError("Telefone inválido. Use (11) 91234-5678 ou similar.")
        if len(digitos) in (10, 11):
            ddd, num = digitos[:2], digitos[2:]
            return f"({ddd}) {num[:5]}-{num[5:]}" if len(num) == 9 \
                   else f"({ddd}) {num[:4]}-{num[4:]}"
        return v.strip()


class ClienteOut(BaseModel):
    id: int
    nome: str
    telefone: str
    email: str


class ClienteUpdate(BaseModel):
    nome: str | None = None
    telefone: str | None = None
    email: EmailStr | None = None


# ── rotas ─────────────────────────────────────────────────────────────────

@app.get("/clientes", response_model=list[ClienteOut], summary="Listar todos os clientes")
def listar():
    return db.listar_todos()


@app.get("/clientes/{id_cliente}", response_model=ClienteOut, summary="Buscar por ID")
def buscar_id(id_cliente: int):
    cliente = db.buscar_por_id(id_cliente)
    if not cliente:
        raise HTTPException(404, detail="Cliente não encontrado.")
    return cliente


@app.get("/buscar", response_model=list[ClienteOut], summary="Buscar por nome (parcial)")
def buscar_nome(q: str = Query(..., min_length=1, description="Trecho do nome")):
    return svc.buscar_cliente(q)


@app.post("/clientes", response_model=ClienteOut, status_code=201, summary="Criar cliente")
def criar(dados: ClienteIn):
    try:
        return svc.cadastrar_cliente(dados.nome, dados.telefone, dados.email)
    except svc.ErroNegocio as e:
        raise HTTPException(409, detail=str(e))


@app.put("/clientes/{id_cliente}", response_model=ClienteOut, summary="Atualizar cliente")
def atualizar(id_cliente: int, dados: ClienteUpdate):
    cliente = db.buscar_por_id(id_cliente)
    if not cliente:
        raise HTTPException(404, detail="Cliente não encontrado.")

    nome     = dados.nome     or cliente["nome"]
    telefone = dados.telefone or cliente["telefone"]
    email    = dados.email    or cliente["email"]

    try:
        return svc.alterar_cliente(id_cliente, nome, telefone, email)
    except svc.ErroNegocio as e:
        raise HTTPException(409, detail=str(e))


@app.delete("/clientes/{id_cliente}", status_code=204, summary="Deletar cliente")
def deletar(id_cliente: int):
    try:
        svc.excluir_cliente(id_cliente)
    except svc.ErroNegocio as e:
        raise HTTPException(404, detail=str(e))


@app.get("/logs", summary="Ver logs de auditoria")
def ver_logs(limite: int = Query(20, ge=1, le=100)):
    return svc.listar_logs(limite)