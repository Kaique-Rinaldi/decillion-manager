programa
{

/// FUNÇÃO - MOSTRAR CLIENTE=================================================================================================

		cadeia nomeCliente[1000]
    		cadeia telefoneCliente[1000]
    		cadeia emailCliente[1000]
   	 	real valorProjeto[1000]
    		cadeia statusPagamento[1000]
    		cadeia statusProjeto[1000]
    		cadeia datainicioProjeto[1000]
    		cadeia datafinalProjeto[1000]

    funcao mostrarCliente(inteiro i, inteiro totalClientes){
    		se(i >= 0 e i < totalClientes){
        	escreva("\nNome: ", nomeCliente[i])
        	escreva("\nTelefone: ", telefoneCliente[i])
        	escreva("\nE-mail: ", emailCliente[i])
        	escreva("\nValor do Projeto: ", valorProjeto[i])
        	escreva("\nStatus do Pagamento: ", statusPagamento[i])
        	escreva("\nData de Início: ", datainicioProjeto[i])
        	escreva("\nData Final: ", datafinalProjeto[i])
        	escreva("\nStatus do Projeto: ", statusProjeto[i])
    		}
    	}

/// FUNÇÃO - CADASTRAR CLIENTE=================================================================================================

    		inteiro pagamentoStatus, opcaostatusProjeto

	funcao inteiro cadastrarCliente(inteiro totalClientes){

    			se(totalClientes >= 1000){
        			escreva("\nLimite de clientes atingido!")
        		retorne totalClientes
    			}

    			cadeia userNovo
    			logico existe = falso
    			inteiro i

    			escreva("Nome ", totalClientes+1, ": ")
    			leia(userNovo)

    			// Verifica duplicidade
    			para(i = 0; i < totalClientes; i++){
        			se(userNovo == nomeCliente[i]){
          			  existe = verdadeiro
       		 	}
    			}

    			se(existe == verdadeiro){
        			escreva("\nUsuário já cadastrado!")
        		retorne totalClientes
    			}

    			// ✅ Cadastro
    			nomeCliente[totalClientes] = userNovo

    			escreva("Telefone: ")
    			leia(telefoneCliente[totalClientes])

    			escreva("E-mail: ")
    			leia(emailCliente[totalClientes])

    			escreva("Valor do Projeto: ")
    			leia(valorProjeto[totalClientes])

    			escreva("Status do Pagamento")
			escreva("\n1 - Pago")
			escreva("\n2 - Pendente")
			escreva("\nEscolha uma opção: ")
			leia(pagamentoStatus)

// 🔒 VALIDAÇÃO (COLOCA EXATAMENTE AQUI)
			enquanto(pagamentoStatus < 1 ou pagamentoStatus > 2){
    				escreva("\nOpção inválida! \nEscolha uma opção válida: ")
    				leia(pagamentoStatus)
			}
			
// 🔁 CONVERSÃO
			se(pagamentoStatus == 1){
    				statusPagamento[totalClientes] = "PAGO"
			}senao{
    				statusPagamento[totalClientes] = "PENDENTE"
			}

    			escreva("Data de Início (DD/MM/AAAA): ")
			leia(datainicioProjeto[totalClientes])

			enquanto(datainicioProjeto[totalClientes] == ""){
    				escreva("Data inválida! Digite novamente: ")
    				leia(datainicioProjeto[totalClientes])
			}

    			escreva("Data de Término (DD/MM/AAAA): ")
			leia(datafinalProjeto[totalClientes])

			enquanto(datafinalProjeto[totalClientes] == ""){
    				escreva("Data inválida! Digite novamente: ")
    				leia(datafinalProjeto[totalClientes])
			}

    			escreva("Status do Projeto:")
    			escreva("\n1 - Aguardando")
    			escreva("\n2 - Em andamento")
    			escreva("\n3 - Concluído")
    			escreva("\n4 - Atrasado")
    			escreva("\nEscolha uma opção: ")
    			leia(opcaostatusProjeto)

    			enquanto(opcaostatusProjeto < 1 ou opcaostatusProjeto > 4){
    				escreva("\nOpção inválida!")
    				escreva("\nEscolha uma opção válida: ")
    				leia(opcaostatusProjeto)
			}

    			se(opcaostatusProjeto == 1){
        			statusProjeto[totalClientes] = "AGUARDANDO"
    			}senao se(opcaostatusProjeto == 2){
        			statusProjeto[totalClientes] = "EM ANDAMENTO"
    			}senao se(opcaostatusProjeto == 3){
        			statusProjeto[totalClientes] = "CONCLUÍDO"
    			}senao se(opcaostatusProjeto == 4){
        			statusProjeto[totalClientes] = "ATRASADO"
    			}senao{
        			escreva("\nOpção inválida!")
        			statusProjeto[totalClientes] = "AGUARDANDO"
    			}

    				escreva("\nCliente cadastrado com sucesso!")

    			retorne totalClientes + 1
			}

/// FUNÇÃO - LISTAR CLIENTES=================================================================================================

		funcao listarClientes(inteiro totalClientes){

    			inteiro i

    			se(totalClientes == 0){
        			escreva("\nNenhum cliente cadastrado!")
    			}senao{
        			escreva("\nTotal de clientes: ", totalClientes)

        		para(i = 0; i < totalClientes; i++){
            		escreva("\n\nCliente ", i+1)
            		mostrarCliente(i, totalClientes)
        		}
    		}
	}

/// FUNÇÃO - BUSCAR CLIENTES=================================================================================================

		funcao buscarCliente(inteiro totalClientes){

    			cadeia nomeBusca
    			inteiro i
    			logico encontrado = falso

    			escreva("\nDigite o nome do cliente: ")
    			leia(nomeBusca)

    // Percorre todos os clientes
    			para(i = 0; i < totalClientes; i++){

        // Se encontrar o nome
        		se(nomeBusca == nomeCliente[i]){

            		escreva("\nCliente encontrado!")
            		mostrarCliente(i, totalClientes)

            		encontrado = verdadeiro
		// para o loop
            	pare 
        		}
    		}

    // Se não encontrou nenhum
    			se(encontrado == falso){
        		escreva("\nCliente não encontrado!")
    			}
		}

/// FUNÇÃO - EXCLUIR CLIENTE=================================================================================================

		funcao inteiro excluirCliente(inteiro totalClientes){

    			cadeia nomeExcluir
    			inteiro i, j
    			logico encontrado = falso
    			cadeia confirmar

    			escreva("\nDigite o nome do cliente que deseja excluir: ")
    			leia(nomeExcluir)

    // Busca o cliente
    			para(i = 0; i < totalClientes; i++){

        			se(nomeExcluir == nomeCliente[i]){

            			escreva("\nCliente encontrado!")
            			mostrarCliente(i, totalClientes)

            			encontrado = verdadeiro

            			escreva("\nDigite 'CONFIRMAR' para excluir: ")
            			leia(confirmar)

            	se(confirmar == "CONFIRMAR" ou confirmar == "confirmar" ou confirmar == "Confirmar"){

                // SHIFT (reorganiza o vetor)
                para(j = i; j < totalClientes - 1; j++){

                    nomeCliente[j] = nomeCliente[j+1]
                    telefoneCliente[j] = telefoneCliente[j+1]
                    emailCliente[j] = emailCliente[j+1]
                    valorProjeto[j] = valorProjeto[j+1]
                    statusPagamento[j] = statusPagamento[j+1]
                    datainicioProjeto[j] = datainicioProjeto[j+1]
                    datafinalProjeto[j] = datafinalProjeto[j+1]
                    statusProjeto[j] = statusProjeto[j+1]
                }

                escreva("\nCliente excluído com sucesso!")

                retorne totalClientes - 1
            }senao{
                escreva("\nExclusão cancelada.")
                retorne totalClientes
            }
        }
    }

    // Caso não encontre
    			se(encontrado == falso){
        			escreva("\nCliente não encontrado!")
    			}

    			retorne totalClientes
			}

/// FUNÇÃO - ALTERAR CLIENTE=================================================================================================

		funcao alterarCliente(inteiro totalClientes){

  			cadeia nomeBusca
    			inteiro i
    			logico encontrado = falso

    			escreva("\nDigite o nome do cliente que deseja alterar: ")
    			leia(nomeBusca)

    // BUSCA
    			para(i = 0; i < totalClientes; i++){
        			se(nomeBusca == nomeCliente[i]){
			
            			encontrado = verdadeiro

            			escreva("\nCliente encontrado!")
            			mostrarCliente(i, totalClientes)

            			cadeia confirmar
            			escreva("\nDigite 'ALTERAR' para confirmar: ")
            			leia(confirmar)

            		se(confirmar == "ALTERAR" ou confirmar == "alterar"){

                	cadeia nomeNew, telefoneNew, emailNew
                	real valorNew
                	cadeia dataInicioNew, dataFinalNew
                	inteiro statusNew, statusProjetoNew

                // NOVOS DADOS
                	escreva("\nNovo Nome: ")
                	leia(nomeNew)

                	escreva("Novo Telefone: ")
                	leia(telefoneNew)

                	escreva("Novo Email: ")
                	leia(emailNew)

                	escreva("Novo valor do Projeto: ")
                	leia(valorNew)

                // STATUS PAGAMENTO
                	escreva("\nStatus do Pagamento")
                	escreva("\n1 - Pago")
                	escreva("\n2 - Pendente")
                	escreva("\nEscolha: ")
                	leia(statusNew)

				enquanto(statusNew < 1 ou statusNew > 2){
    					escreva("Opção inválida! \nEscolha uma opção válida: ")
    					leia(statusNew)
				}

                	se(statusNew == 1){
    					statusPagamento[i] = "PAGO"
				}senao{
    					statusPagamento[i] = "PENDENTE"
				}

                // DATAS
                	escreva("Nova data de início (DD/MM/AAAA): ")
				leia(dataInicioNew)

				enquanto(dataInicioNew == ""){
    					escreva("Data inválida! Digite novamente: ")
    					leia(dataInicioNew)
				}

				escreva("Nova data final (DD/MM/AAAA): ")
				leia(dataFinalNew)

				enquanto(dataFinalNew == ""){
    				escreva("Data inválida! Digite novamente: ")
    					leia(dataFinalNew)
				}

                // STATUS PROJETO
                	escreva("\nStatus do Projeto:")
                	escreva("\n1 - Aguardando")
                	escreva("\n2 - Em andamento")
                	escreva("\n3 - Concluído")
                	escreva("\n4 - Atrasado")
                	escreva("\nEscolha uma opção: ")
                	leia(statusProjetoNew)         

				enquanto(statusProjetoNew < 1 ou statusProjetoNew > 4){
    					escreva("Opção inválida! \nEscolha uma opção válida: ")
    					leia(statusProjetoNew)
				}

                	se(statusProjetoNew == 1){
                    	statusProjeto[i] = "AGUARDANDO"
                	}senao se(statusProjetoNew == 2){
                   		statusProjeto[i] = "EM ANDAMENTO"
                	}senao se(statusProjetoNew == 3){
                    	statusProjeto[i] = "CONCLUÍDO"
                	}senao se(statusProjetoNew == 4){
                   		statusProjeto[i] = "ATRASADO"
               	}

                // ATUALIZAÇÃO
                	nomeCliente[i] = nomeNew
                	telefoneCliente[i] = telefoneNew
                	emailCliente[i] = emailNew
                	valorProjeto[i] = valorNew
                	datainicioProjeto[i] = dataInicioNew
                	datafinalProjeto[i] = dataFinalNew

                	escreva("\nCliente alterado com sucesso!")
            	}
            		pare
        		}
    		}
    			se(encontrado == falso){
        			escreva("\nCliente não encontrado!")
    			}
		}

/// FUNÇÃO - RELATÓRIO=================================================================================================

		funcao relatorio(inteiro totalClientes){

    			se(totalClientes == 0){
        			escreva("\nNenhum cliente cadastrado!")
        		retorne
    			}

    			inteiro i
    			inteiro pendentes = 0
    			inteiro pagos = 0
    			real totalPendente = 0.0
    			real totalPago = 0.0

    			escreva("\n===== RELATÓRIO GERAL =====")
    			escreva("\nTotal de clientes: ", totalClientes)

    // STATUS DOS PROJETOS
    			escreva("\n\nStatus dos Projetos:")
    			para(i = 0; i < totalClientes; i++){
        			escreva("\nCliente ", i+1, ": ", statusProjeto[i])
    			}

    // PAGAMENTOS
    			para(i = 0; i < totalClientes; i++){

        		se(statusPagamento[i] == "PENDENTE"){
            		pendentes++
            		totalPendente = totalPendente + valorProjeto[i]
        		}

        		senao se(statusPagamento[i] == "PAGO"){
            		pagos++
            		totalPago = totalPago + valorProjeto[i]
        		}
    		}

    // RESULTADOS
    			escreva("\n\n===== FINANCEIRO =====")
    			escreva("\nPagamentos Pendentes: ", pendentes)
    			escreva("\nValor a Receber: R$ ", totalPendente)

    			escreva("\n\nPagamentos Recebidos: ", pagos)
    			escreva("\nValor Recebido: R$ ", totalPago)
		}

/// FUNÇÃO - FILTRAR PAGAMENTOS PENDENTES=================================================================================================

		funcao filtrarPendentes(inteiro totalClientes){

    			se(totalClientes == 0){
        			escreva("\nNenhum cliente cadastrado!")
        		retorne
    			}

    			inteiro i
    			inteiro pendentes = 0

    // 🔢 Conta quantos são pendentes
    			para(i = 0; i < totalClientes; i++){
        			se(statusPagamento[i] == "PENDENTE"){
            		pendentes++
        			}
    			}

    				escreva("\nTotal de pagamentos pendentes: ", pendentes)

    // ⚠️ Se não tiver nenhum
    				se(pendentes == 0){
        				escreva("\nNenhum cliente com pagamento pendente!")
        			retorne
    				}

    					escreva("\n\n=== CLIENTES COM PAGAMENTO PENDENTE ===")

    // 📋 Lista os clientes
    				para(i = 0; i < totalClientes; i++){
        				se(statusPagamento[i] == "PENDENTE"){
            				mostrarCliente(i, totalClientes)
        				}
    				}
			}

/// FUNÇÃO - FILTRAR PAGAMENTOS RECEBIDOS

		funcao listarPagos(inteiro totalClientes){

    		inteiro i
    		inteiro pagos = 0

    // 🔢 Conta quantos estão pagos
    		para(i = 0; i < totalClientes; i++){
        		se(statusPagamento[i] == "PAGO"){
            	pagos++
        		}
    		}

    			escreva("\nTotal de pagamentos recebidos: ", pagos)

    // 📋 Lista os clientes pagos
    			escreva("\nLista de clientes que realizaram o Pagamento:\n")

    			para(i = 0; i < totalClientes; i++){
        			se(statusPagamento[i] == "PAGO"){
            			mostrarCliente(i, totalClientes)
        			}
    			}
		}
			

    	
	
	funcao inicio()
	{

		inteiro opcao
		inteiro totalClientes = 0
		inteiro i
		cadeia nomeBusca, nomeExcluir, nomeAlterar
		cadeia confirmar, alterar
		inteiro j
		cadeia nomeNew, telefoneNew, emailNew
		inteiro datainicioNew, datafinalNew, statusProjetoNew
		inteiro statusNew
		real valorNew
		cadeia senhaTemp
		inteiro opcaoAdmin
		cadeia loginAdmin[5000]
		cadeia senhaAdmin[5000]
		inteiro totalAdmin = 0
		inteiro z
		cadeia senhaAdminEnter, loginAdminEnter
		inteiro y
		real totalReceber
		

		// MENU INICIAL (CADASTRO OU LOGIN)
		faca{
    			escreva("\n1 - Cadastrar Empresa")
    			escreva("\n2 - Fazer Login")
    			escreva("\nEscolha uma opção: ")
    			leia(opcaoAdmin)

    // CADASTRO DE ADMIN
    	se(opcaoAdmin == 1){
        	se(totalAdmin < 5000){

            cadeia adminNovo
            logico existeAdmin = falso
	
            escreva("Cadastre seu login ", totalAdmin+1, ": ")
            leia(adminNovo)

            // VERIFICA DUPLICIDADE
            para(z = 0; z < totalAdmin; z++){
                se(adminNovo == loginAdmin[z]){
                    existeAdmin = verdadeiro
                }
            }

            se(existeAdmin == verdadeiro){
                escreva("\nAdmin já cadastrado!")
            }senao{
                loginAdmin[totalAdmin] = adminNovo

                escreva("Cadastre sua senha (mínimo 8 caracteres): ")
                leia(senhaAdmin[totalAdmin])

                totalAdmin++
                escreva("\nAdmin cadastrado com sucesso!")
            }
        }senao{
            escreva("\nLimite de admins atingido!")
        }
    }

    // BLOQUEIO: NÃO DEIXA IR PRO LOGIN SEM ADMIN
    se(opcaoAdmin == 2 e totalAdmin == 0){
        escreva("\nNenhum admin cadastrado! Cadastre primeiro.")
        opcaoAdmin = 0 // força continuar no loop
    }

}enquanto(opcaoAdmin != 2)


// ================= LOGIN =================

logico logado = falso

faca{

    logico encontrouLogin = falso

    escreva("\nDigite seu Login de Admin: ")
    leia(loginAdminEnter)

    para(z = 0; z < totalAdmin; z++){
        se(loginAdminEnter == loginAdmin[z]){
            encontrouLogin = verdadeiro

            escreva("\nDigite sua Senha: ")
            leia(senhaAdminEnter)

            se(senhaAdminEnter == senhaAdmin[z]){
                logado = verdadeiro
                escreva("\nLogin realizado com sucesso!")
            }senao{
                escreva("\nSenha incorreta!")
            }

            pare
        }
    }

    se(encontrouLogin == falso){
        escreva("\nLogin não encontrado!")
    }

}enquanto(logado == falso)

			/// MENU 


			faca{
			escreva("\n\n=====DECILLION MANAGER=====")
			escreva("\n\n1 - Cadastrar Cliente")
			escreva("\n2 - Listar Clientes")
			escreva("\n3 - Buscar Cliente")
			escreva("\n4 - Excluir Cliente")
			escreva("\n5 - Alterar Cliente")
			escreva("\n6 - Relatório")
			escreva("\n7 - Filtrar status de pagamentos pendentes")
			escreva("\n8 - Filtrar status de pagamentos recebidos")
			escreva("\n99 - Sair")
			escreva("\nEscolha uma opção: ")
			leia(opcao)

			enquanto(opcao != 1 e opcao != 2 e opcao != 3 e opcao != 4 e opcao != 5 e opcao != 6 e opcao != 7 e opcao != 8 e opcao != 99){
    				escreva("\nOpção inválida! \nEscolha uma opção válida: ")
    				leia(opcao)
			}
		

	///ENTRADA DE DADOS

		se(opcao == 1){
    			totalClientes = cadastrarCliente(totalClientes)
		}

		se(opcao == 2){
			listarClientes(totalClientes)
		}
		
		se(opcao == 3){
    			buscarCliente(totalClientes)
		}

		se(opcao == 4){
   			totalClientes = excluirCliente(totalClientes)
		}

 
		se(opcao == 5){
			alterarCliente(totalClientes)
		}

		se(opcao == 6){
			relatorio(totalClientes)
		}

		se(opcao == 7){				
    			filtrarPendentes(totalClientes)
		}
		
		se(opcao == 8){
			listarPagos(totalClientes)
		}
			
				}enquanto(opcao !=99)
			
			}
	}

/* $$$ Portugol Studio $$$ 
 * 
 * Esta seção do arquivo guarda informações do Portugol Studio.
 * Você pode apagá-la se estiver utilizando outro editor.
 * 
 * @POSICAO-CURSOR = 17639; 
 * @PONTOS-DE-PARADA = ;
 * @SIMBOLOS-INSPECIONADOS = ;
 * @FILTRO-ARVORE-TIPOS-DE-DADO = inteiro, real, logico, cadeia, caracter, vazio;
 * @FILTRO-ARVORE-TIPOS-DE-SIMBOLO = variavel, vetor, matriz, funcao;
 */