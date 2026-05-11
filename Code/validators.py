import re


def normalizar(texto: str) -> str:
    return texto.strip().lower()


def validar_nome(nome: str) -> tuple[bool, str]:
    nome = nome.strip()
    if not nome:
        return False, "O nome não pode ser vazio."
    if len(nome) < 2:
        return False, "O nome deve ter pelo menos 2 caracteres."
    if not re.match(r"^[A-Za-zÀ-ÿ\s]+$", nome):
        return False, "O nome deve conter apenas letras e espaços."
    return True, nome


def validar_telefone(telefone: str) -> tuple[bool, str]:
    """Aceita: (11) 91234-5678 | 11912345678 | +5511912345678"""
    digitos = re.sub(r"\D", "", telefone)
    if not (10 <= len(digitos) <= 13):
        return False, "Telefone inválido. Use (11) 91234-5678 ou similar."
    if len(digitos) in (10, 11):
        ddd, numero = digitos[:2], digitos[2:]
        fmt = f"({ddd}) {numero[:5]}-{numero[5:]}" if len(numero) == 9 \
              else f"({ddd}) {numero[:4]}-{numero[4:]}"
        return True, fmt
    return True, telefone.strip()


def validar_email(email: str) -> tuple[bool, str]:
    email = email.strip().lower()
    if not re.match(r"^[\w\.\+\-]+@[\w\-]+\.[a-z]{2,}(\.[a-z]{2,})?$", email):
        return False, "E-mail inválido. Ex: nome@dominio.com"
    return True, email


def input_validado(prompt: str, validador) -> str:
    """Loop de input até passar na validação."""
    while True:
        valor = input(prompt)
        ok, resultado = validador(valor)
        if ok:
            return resultado
        print(f"  ✗ {resultado}")