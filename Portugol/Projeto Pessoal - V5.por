programa
{

		cadeia nomeCliente[1000]
    		cadeia telefoneCliente[1000]
    		cadeia emailCliente[1000]
   	 	real valorProjeto[1000]
    		cadeia statusPagamento[1000]
    		cadeia statusProjeto[1000]
    		inteiro datainicioProjeto[1000]
    		inteiro datafinalProjeto[1000]

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

    
	
	funcao inicio()
	{

		inteiro opcao
		inteiro totalClientes = 0
		inteiro i
		cadeia loginBusca, loginExcluir, loginAlterar
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
		inteiro pagamentoStatus, opcaostatusProjeto
		real totalReceber
		

	///MENU
		faca{
			escreva("\n1 - Cadastrar Empresa")
			escreva("\n2 - Fazer Login")
			escreva("\nEscolha uma opção: ")
			leia(opcaoAdmin)

			
			se(opcaoAdmin == 1){
				se(totalAdmin < 5000){
				
				cadeia adminNovo
        			logico existeAdmin = falso

        			escreva("Cadastre seu Login ", totalAdmin+1, ": ")
        			leia(adminNovo)

       
        		para(z = 0; z < totalAdmin; z++){
            		se(adminNovo == loginAdmin[z]){
               		 existeAdmin = verdadeiro
            }
        }

        		se(existeAdmin == verdadeiro){
            		escreva("\nAdmin já cadastrado!")
       		 }senao{
            		loginAdmin[totalAdmin] = adminNovo

            		escreva("Cadastre sua Senha(mínimo de 8 dígitos) ", totalAdmin+1, ": ")
            		leia(senhaAdmin[totalAdmin])
            		
            		totalAdmin++
            		
            		}
        }
    }
			}enquanto(opcaoAdmin != 2)	

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
		

	///ENTRADA DE DADOS

		se(opcao == 1){
    			se(totalClientes < 1000){

        			cadeia userNovo
        			logico existe = falso

        			escreva("Nome ", totalClientes+1, ": ")
        			leia(userNovo)
       
        		para(i = 0; i < totalClientes; i++){
            		se(userNovo == nomeCliente[i]){
               		 existe = verdadeiro
            }
        }

        		se(existe == verdadeiro){
            		escreva("\nUsuário já cadastrado!")
       		 }senao{

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

				// 🔥 CONVERSÃO
				se(pagamentoStatus == 1){
    					statusPagamento[totalClientes] = "PAGO"
				}senao{
    					se(pagamentoStatus == 2){
        					statusPagamento[totalClientes] = "PENDENTE"

    					}senao{
        					escreva("\nOpção inválida!")
    				}
			}

            		escreva("Data de Início do Projeto: ")
            		leia(datainicioProjeto[totalClientes])

            		escreva("Data Prevista para Término do Projeto: ")
            		leia(datafinalProjeto[totalClientes])

            		escreva("Status do Projeto:")
            		escreva("\n1 - Aguardando")
				escreva("\n2 - Em andamento")
				escreva("\n3 - Concluído")
				escreva("\n4 - Atrasado")
				escreva("\nEscolha uma opção: ")
				leia(opcaostatusProjeto)

				
				se(opcaostatusProjeto == 1){
					statusProjeto[totalClientes] = "AGUARDANDO"
				}
				senao se(opcaostatusProjeto == 2){
    					statusProjeto[totalClientes] = "EM ANDAMENTO"
				}senao se(opcaostatusProjeto == 3){
    					statusProjeto[totalClientes] = "CONCLUIDO"
				}senao se(opcaostatusProjeto == 4){
    					statusProjeto[totalClientes] = "ATRASADO"
				}senao{
    					escreva("\nOpção inválida!")
				}
            		
            		totalClientes++
            		}
        }
    }

		se(opcao == 2){
			se(totalClientes == 0){
				escreva("\nNenhum cliente Cadastrado")
			}senao{
			escreva("\nExiste um total de ", totalClientes, " clientes cadastrados.")
			}

			
			
			
			para(i = 0; i < totalClientes; i++){
				escreva("\n\nCliente ", i+1)
				mostrarCliente(i, totalClientes)
		
		}
		}
		
		se(opcao == 3){
			escreva("Digite o nome do Cliente: ")
			leia(loginBusca)

			logico encontrado = falso

			para(i = 0; i < totalClientes; i++){

			se(loginBusca == nomeCliente[i]){
				escreva("\nCliente encontrado!")
				mostrarCliente(i, totalClientes)
				

				encontrado = verdadeiro

				pare
			}
			}
		
			se(encontrado == falso){
				escreva("\nCliente não encontrado!")
			}
				
		}	

			se(opcao == 4){
   				escreva("Digite o nome do cliente que deseja excluir: ")
   				leia(loginExcluir)

   				logico encontrado = falso

   				para(i = 0; i < totalClientes; i++){

      			se(loginExcluir == nomeCliente[i]){
        				escreva("\nCliente encontrado!")
        				mostrarCliente(i, totalClientes)		

         				encontrado = verdadeiro

         				escreva("\nDigite 'CONFIRMAR' para excluir cliente: ")
         				leia(confirmar)

         			se(confirmar == "CONFIRMAR" ou confirmar == "confirmar" ou confirmar == "Confirmar"){
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

         			}

            			totalClientes--

            			escreva("\nCliente excluído com sucesso!")

            			pare
         			
         }

      }

   				se(encontrado == falso){
      			escreva("\nCliente não encontrado!")
   				}

   }
		
				se(opcao == 5){
    					escreva("\nDigite o nome do cliente que deseja alterar: ")
    					leia(loginAlterar)

    					logico encontrado = falso
    					inteiro a

    					para(i = 0; i < totalClientes; i++){

        				se(loginAlterar == nomeCliente[i]){

            				encontrado = verdadeiro

            				escreva("\nUsuário encontrado!")
            				mostrarCliente(i, totalClientes)

            				escreva("\nDigite 'ALTERAR' para confirmar: ")
            				leia(alterar)

           		 	se(alterar == "ALTERAR" ou alterar == "alterar" ou alterar == "Alterar"){
		
                			escreva("\nNovo Nome: ")
               			leia(nomeNew)
            			
                    		escreva("\nNovo Telefone: ")
                    		leia(telefoneNew)

                    		escreva("\nNovo Email: ")
                    		leia(emailNew)

                    		escreva("\nNovo valor do Projeto: ")
                    		leia(valorNew)

                    		escreva("\nNovo Status de Pagamento: ")
						escreva("\n1 - Pago")
						escreva("\n2 - Pendente")
						escreva("\nEscolha uma opção: ")
						leia(statusNew)

				// 🔥 CONVERSÃO
						se(statusNew == 1){
    							statusPagamento[i] = "PAGO"
						}senao{
    							se(statusNew == 2){
        							statusPagamento[i] = "PENDENTE"			
    						}senao{
        						escreva("\nOpção inválida!")
    				}
			}

                    		escreva("\nNova data de inicio do projeto: ")
                    		leia(datainicioNew)

                    		escreva("\nNova data prevista de término do projeto: ")
                    		leia(datafinalNew)

						escreva("\nNovo Status do Projeto:")
						escreva("\n1 - Aguardando")
						escreva("\n2 - Em andamento")
						escreva("\n3 - Concluído")
						escreva("\n4 - Atrasado")
						leia(statusProjetoNew)

						se(statusProjetoNew == 1){
							statusProjeto[i] = "AGUARDANDO"	
						}senao se(statusProjetoNew == 2){
    							statusProjeto[i] = "EM ANDAMENTO"
						}senao se(statusProjetoNew == 3){
    							statusProjeto[i] = "CONCLUIDO"
						}senao se(statusProjetoNew == 4){
    							statusProjeto[i] = "ATRASADO"
						}

                    		nomeCliente[i] = nomeNew
                    		telefoneCliente[i] = telefoneNew
                    		emailCliente[i] = emailNew
                    		valorProjeto[i] = valorNew
                    		datainicioProjeto[i] = datainicioNew
                    		datafinalProjeto[i] = datafinalNew                    		
                    		

                    		escreva("\nUsuário alterado com sucesso!")
                		
            		}

            				pare
        }
    }

    						se(encontrado == falso){
        						escreva("\nCliente não encontrado!")
    }
}

				se(opcao == 6){
					se(totalClientes == 0){
						escreva("\nNenhum cliente Cadastrado")
					}senao{
						escreva("\nTotal de clientes cadastrados: ", totalClientes)
						
						
						para(i = 0; i < totalClientes; i++){
    							escreva("\nCliente ", i+1, " - Status do Projeto: ", statusProjeto[i])
						}
								

    						inteiro pendentes = 0

    						para(i = 0; i < totalClientes; i++){
        						se(statusPagamento[i] == "PENDENTE"){
            					pendentes++
        				}
    				}

    						escreva("\nTotal de pagamentos pendentes: ", pendentes)



    						real totalPendente = 0.0

						para(i = 0; i < totalClientes; i++){
    							se(statusPagamento[i] == "PENDENTE"){
        							totalPendente = totalPendente + valorProjeto[i]
    					}
				}

						escreva("\nValor a receber: R$ ", totalPendente)


						inteiro pagos = 0

						para(i = 0; i < totalClientes; i++){
							se(statusPagamento[i] == "PAGO"){
								pagos++
				
							}
						}

						escreva("\nTotal de pagamentos recebidos: ", pagos)


						real totalPago = 0.0

						para(i = 0; i < totalClientes; i++){
							se(statusPagamento[i] == "PAGO"){
								totalPago = totalPago + valorProjeto[i]
							}
						}

						escreva("\nValor recebido: ", totalPago)
		
				}
						
						
					}


					se(opcao == 7){

						inteiro pendentes = 0
						
						para(i = 0; i < totalClientes; i++){
							se(statusPagamento[i] == "PENDENTE"){
								pendentes++
								
							}
						}
						escreva("\nTotal de pagamentos pendentes: ", pendentes)

						escreva("\nLista de clientes com Pagamentos Pendentes: ")

						para(i = 0; i < totalClientes; i++){
							se(statusPagamento[i] == "PENDENTE"){
								
								mostrarCliente(i, totalClientes)
								
							}
						}
						
					}

					se(opcao == 8){

						inteiro pagos = 0
						
						para(i = 0; i < totalClientes; i++){
							se(statusPagamento[i] == "PAGO"){
								pagos++
								
							}
						}
						escreva("\nTotal de pagamentos recebidos: ", pagos)

						escreva("\nLista de clientes que realizaram o Pagamento: ")

						para(i = 0; i < totalClientes; i++){
							se(statusPagamento[i] == "PAGO"){
								
								mostrarCliente(i, totalClientes)
							}
						}
						
					}
			
			

	

				}enquanto(opcao !=99)




		}
	}


/* $$$ Portugol Studio $$$ 
 * 
 * Esta seção do arquivo guarda informações do Portugol Studio.
 * Você pode apagá-la se estiver utilizando outro editor.
 * 
 * @POSICAO-CURSOR = 788; 
 * @PONTOS-DE-PARADA = ;
 * @SIMBOLOS-INSPECIONADOS = ;
 * @FILTRO-ARVORE-TIPOS-DE-DADO = inteiro, real, logico, cadeia, caracter, vazio;
 * @FILTRO-ARVORE-TIPOS-DE-SIMBOLO = variavel, vetor, matriz, funcao;
 */
