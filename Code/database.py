import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "clientes.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row   # acesso por nome de coluna
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def inicializar_banco() -> None:
    """Cria as tabelas se não existirem."""
    with get_connection() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS clientes (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                nome      TEXT    NOT NULL,
                telefone  TEXT    NOT NULL,
                email     TEXT    NOT NULL UNIQUE
            );

            CREATE TABLE IF NOT EXISTS logs (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                acao      TEXT    NOT NULL,
                descricao TEXT,
                data      TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
            );
        """)