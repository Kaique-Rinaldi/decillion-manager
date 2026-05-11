"""
main.py — interface de menu. Só UI aqui, zero regra de negócio.
"""

from database import inicializar_banco
from validators import input_validado, validar_nome, validar_telefone, validar_email
import clientes as db
import services as svc


# ── helpers de UI ─────────────────────────────────────────────────────────

def exibir_cliente(c: dict) -> None:
    print("\n  ┌─────────────────────────────")
    print(f"  │ ID       : {c['id']}")
    print(f"  │ Nome     : {c['nome']}")
    print(f"  │ Telefone : {c['telefone']}")
    print(f"  │ E-mail   : {c['email']}")
    print("  └─────────────────────────────")


def selecionar_de_lista(resultados: list[dict], sugestao: bool = False) -> dict | None:
    """Exibe lista e pede escolha numérica."""
    if not resultados:
        print("\n  Nenhum cliente encontrado.")
        return None

    label = "Sugestões" if sugestao else "Resultados"
    print(f"\n  {label} ({len(resultados)}):")
    for i, c in enumerate(resultados, 1):
        print(f"  {i}. {c['nome']}  |  ID {c['id']}  |  {c['email']}")

    while True:
        try:
            escolha = int(input("\n  Número do cliente (0 = cancelar): "))
            if escolha == 0:
                return None
            if 1 <= escolha <= len(resultados):
                return resultados[escolha - 1]
        except ValueError:
            pass
        print("  Opção inválida.")


def pedir_cliente(titulo: str) -> dict | None:
    """Pede NOME ou ID e devolve o dict do cliente."""
    print(f"\n  ── {titulo} ──")
    tipo = input("  Buscar por NOME ou ID? ").strip().lower()

    if tipo == "nome":
        termo = input("  Nome (ou trecho): ").strip()
        if not termo:
            print("  Digite ao menos um caractere.")
            return None

        resultados = db.buscar_por_nome(termo)
        if resultados:
            return selecionar_de_lista(resultados)

        # nenhum resultado — tenta sugestões
        sugestoes = svc.buscar_cliente(termo)
        if sugestoes:
            print("\n  Nenhum resultado exato. Você quis dizer?")
            return selecionar_de_lista(sugestoes, sugestao=True)

        print("\n  Nenhum cliente encontrado.")
        return None

    elif tipo == "id":
        try:
            id_busca = int(input("  ID: "))
        except ValueError:
            print("  ID inválido. Digite apenas números.")
            return None
        cliente = db.buscar_por_id(id_busca)
        if not cliente:
            print("\n  Nenhum cliente com esse ID.")
        return cliente

    else:
        print("  Opção inválida. Digite NOME ou ID.")
        return None


# ── ações do menu ─────────────────────────────────────────────────────────

def acao_cadastrar() -> None:
    print("\n  ── Novo cliente ──")
    nome     = input_validado("  Nome     : ", validar_nome)
    telefone = input_validado("  Telefone : ", validar_telefone)
    email    = input_validado("  E-mail   : ", validar_email)

    try:
        cliente = svc.cadastrar_cliente(nome, telefone, email)
        print("\n  ✓ Cliente cadastrado com sucesso!")
        exibir_cliente(cliente)
    except svc.ErroNegocio as e:
        print(f"\n  ⚠ {e}")


def acao_listar() -> None:
    clientes = db.listar_todos()
    if not clientes:
        print("\n  Nenhum cliente cadastrado.")
        return
    print(f"\n  {len(clientes)} cliente(s) cadastrado(s):")
    for c in clientes:
        exibir_cliente(c)


def acao_buscar() -> None:
    cliente = pedir_cliente("Buscar cliente")
    if cliente:
        print("\n  Cliente encontrado!")
        exibir_cliente(cliente)


def acao_alterar() -> None:
    cliente = pedir_cliente("Alterar cliente")
    if not cliente:
        return

    print("\n  Cliente selecionado:")
    exibir_cliente(cliente)
    print("\n  Deixe em branco para manter o valor atual.")

    def campo(prompt, atual, validador):
        entrada = input(f"  {prompt} [{atual}]: ").strip()
        if not entrada:
            return atual
        ok, resultado = validador(entrada)
        if ok:
            return resultado
        print(f"  ✗ {resultado} — mantendo valor anterior.")
        return atual

    nome     = campo("Nome",     cliente["nome"],     validar_nome)
    telefone = campo("Telefone", cliente["telefone"], validar_telefone)
    email    = campo("E-mail",   cliente["email"],    validar_email)

    try:
        atualizado = svc.alterar_cliente(cliente["id"], nome, telefone, email)
        print("\n  ✓ Cliente alterado com sucesso!")
        exibir_cliente(atualizado)
    except svc.ErroNegocio as e:
        print(f"\n  ⚠ {e}")


def acao_excluir() -> None:
    cliente = pedir_cliente("Excluir cliente")
    if not cliente:
        return

    print("\n  Cliente a ser excluído:")
    exibir_cliente(cliente)

    confirmar = input("\n  Digite CONFIRMAR para excluir: ").strip()
    if confirmar == "CONFIRMAR":
        try:
            svc.excluir_cliente(cliente["id"])
            print("  ✓ Cliente removido com sucesso!")
        except svc.ErroNegocio as e:
            print(f"\n  ⚠ {e}")
    else:
        print("  Exclusão cancelada.")


def acao_logs() -> None:
    logs = svc.listar_logs(limite=20)
    if not logs:
        print("\n  Nenhum log registrado.")
        return
    print(f"\n  Últimos {len(logs)} eventos:\n")
    print(f"  {'DATA':<20} {'AÇÃO':<12} DESCRIÇÃO")
    print(f"  {'─'*20} {'─'*12} {'─'*35}")
    for log in logs:
        print(f"  {log['data']:<20} {log['acao']:<12} {log['descricao']}")


# ── menu principal ────────────────────────────────────────────────────────

MENU = """
══════════════════════════════
      GESTÃO DE CLIENTES
══════════════════════════════
  1 - Cadastrar cliente
  2 - Listar clientes
  3 - Buscar cliente
  4 - Alterar cliente
  5 - Excluir cliente
  6 - Ver logs do sistema
 99 - Sair
──────────────────────────────"""

ACOES = {
    1: acao_cadastrar,
    2: acao_listar,
    3: acao_buscar,
    4: acao_alterar,
    5: acao_excluir,
    6: acao_logs,
}


def main() -> None:
    inicializar_banco()

    while True:
        print(MENU)
        try:
            opcao = int(input("  Opção: "))
        except ValueError:
            print("  Digite apenas números.")
            continue

        if opcao == 99:
            print("\n  Até logo!\n")
            break

        acao = ACOES.get(opcao)
        if acao:
            try:
                acao()
            except Exception as e:
                print(f"\n  ✗ Erro inesperado: {e}")
        else:
            print("  Opção inválida.")


if __name__ == "__main__":
    main()