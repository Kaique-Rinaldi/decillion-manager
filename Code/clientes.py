from database import get_connection


# ── helpers ────────────────────────────────────────────────────────────────

def _row_para_dict(row) -> dict:
    return dict(row) if row else None


# ── leitura ────────────────────────────────────────────────────────────────

def listar_todos() -> list[dict]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM clientes ORDER BY nome"
        ).fetchall()
    return [dict(r) for r in rows]


def buscar_por_id(id_cliente: int) -> dict | None:
    with get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM clientes WHERE id = ?", (id_cliente,)
        ).fetchone()
    return _row_para_dict(row)


def buscar_por_nome(termo: str) -> list[dict]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM clientes WHERE nome LIKE ? ORDER BY nome",
            (f"%{termo}%",)
        ).fetchall()
    return [dict(r) for r in rows]


def buscar_por_email(email: str) -> dict | None:
    with get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM clientes WHERE email = ?", (email.lower(),)
        ).fetchone()
    return _row_para_dict(row)


def buscar_por_telefone(telefone: str) -> dict | None:
    with get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM clientes WHERE telefone = ?", (telefone,)
        ).fetchone()
    return _row_para_dict(row)


def sugestoes_por_prefixo(prefixo: str) -> list[dict]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM clientes WHERE nome LIKE ? ORDER BY nome LIMIT 5",
            (f"{prefixo}%",)
        ).fetchall()
    return [dict(r) for r in rows]


# ── escrita ────────────────────────────────────────────────────────────────

def inserir(nome: str, telefone: str, email: str) -> dict:
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO clientes (nome, telefone, email) VALUES (?, ?, ?)",
            (nome, telefone, email.lower()),
        )
        conn.commit()
        id_novo = cursor.lastrowid
    return buscar_por_id(id_novo)


def atualizar(id_cliente: int, nome: str, telefone: str, email: str) -> dict:
    with get_connection() as conn:
        conn.execute(
            "UPDATE clientes SET nome=?, telefone=?, email=? WHERE id=?",
            (nome, telefone, email.lower(), id_cliente),
        )
        conn.commit()
    return buscar_por_id(id_cliente)


def deletar(id_cliente: int) -> bool:
    with get_connection() as conn:
        affected = conn.execute(
            "DELETE FROM clientes WHERE id = ?", (id_cliente,)
        ).rowcount
        conn.commit()
    return affected > 0