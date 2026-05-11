"""
services.py — regras de negócio e log de auditoria.

Toda operação que muda dados passa por aqui antes de chegar ao banco.
"""

from database import get_connection
import clientes as db


# ── log de auditoria ───────────────────────────────────────────────────────

def registrar_log(acao: str, descricao: str = "") -> None:
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO logs (acao, descricao) VALUES (?, ?)",
            (acao, descricao),
        )
        conn.commit()


def listar_logs(limite: int = 20) -> list[dict]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM logs ORDER BY id DESC LIMIT ?", (limite,)
        ).fetchall()
    return [dict(r) for r in rows]


# ── erros de negócio ───────────────────────────────────────────────────────

class ErroNegocio(Exception):
    pass


# ── serviços ──────────────────────────────────────────────────────────────

def cadastrar_cliente(nome: str, telefone: str, email: str) -> dict:
    """Valida unicidade antes de inserir."""
    if db.buscar_por_email(email):
        raise ErroNegocio(f"Já existe um cliente com o e-mail '{email}'.")
    if db.buscar_por_telefone(telefone):
        raise ErroNegocio(f"Já existe um cliente com o telefone '{telefone}'.")

    cliente = db.inserir(nome, telefone, email)
    registrar_log("CADASTRO", f"ID {cliente['id']} — {nome} <{email}>")
    return cliente


def alterar_cliente(id_cliente: int, nome: str, telefone: str, email: str) -> dict:
    """Valida unicidade ignorando o próprio registro."""
    existente_email = db.buscar_por_email(email)
    if existente_email and existente_email["id"] != id_cliente:
        raise ErroNegocio(f"O e-mail '{email}' pertence a outro cliente.")

    existente_tel = db.buscar_por_telefone(telefone)
    if existente_tel and existente_tel["id"] != id_cliente:
        raise ErroNegocio(f"O telefone '{telefone}' pertence a outro cliente.")

    cliente = db.atualizar(id_cliente, nome, telefone, email)
    registrar_log("ALTERACAO", f"ID {id_cliente} — novo nome: {nome}")
    return cliente


def excluir_cliente(id_cliente: int) -> None:
    cliente = db.buscar_por_id(id_cliente)
    if not cliente:
        raise ErroNegocio("Cliente não encontrado.")
    db.deletar(id_cliente)
    registrar_log("EXCLUSAO", f"ID {id_cliente} — {cliente['nome']} <{cliente['email']}>")


# ── busca inteligente ─────────────────────────────────────────────────────

def buscar_cliente(termo: str) -> list[dict]:
    """
    Busca por nome (parcial).  Se não achar nada, tenta sugestões
    pelo prefixo das duas primeiras letras.
    """
    resultados = db.buscar_por_nome(termo)
    if resultados:
        return resultados

    # sugestões de fallback: palavras do nome que comecem com as 2 primeiras letras
    prefixo = termo[:2] if len(termo) >= 2 else termo
    return db.sugestoes_por_prefixo(prefixo)