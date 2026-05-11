programa
{
	
	
	
	funcao inicio()
	{

		inteiro opcao
		inteiro totalClientes = 0
		cadeia login[100]
		cadeia senha[100]
		inteiro i
		cadeia loginBusca
		cadeia loginExcluir
		cadeia confirmar, alterar
		inteiro j
		cadeia loginAlterar
		cadeia loginNew, senhaNew
		cadeia senhaTemp
		inteiro opcaoAdmin
		cadeia loginAdmin[50]
		cadeia senhaAdmin[50]
		inteiro totalAdmin = 0
		inteiro z
		cadeia senhaAdminEnter, loginAdminEnter
		inteiro y
		inteiro telefoneCliente[100]
		cadeia emailCliente[100]
		real valorProjeto[100]
		cadeia statusPagamento[100]
		




	///MENU
		faca{
			escreva("\n1 - Cadastrar Empresa")
			escreva("\n2 - Fazer Login")
			escreva("\nEscolha uma opção: ")
			leia(opcaoAdmin)

			

			se(opcaoAdmin == 1){
				se(totalAdmin < 50){
				
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
			escreva("\n99 - Sair")
			escreva("\nEscolha uma opção: ")
			leia(opcao)
		

	///ENTRADA DE DADOS

		se(opcao == 1){
    			se(totalClientes < 100){

        			cadeia userNovo
        			logico existe = falso

        			escreva("Cadastre seu Login ", totalClientes+1, ": ")
        			leia(userNovo)

       
        		para(i = 0; i < totalClientes; i++){
            		se(userNovo == login[i]){
               		 existe = verdadeiro
            }
        }

        		se(existe == verdadeiro){
            		escreva("\nUsuário já cadastrado!")
       		 }senao{

            
            		login[totalClientes] = userNovo

            		escreva("Cadastre sua Senha(mínimo de 8 dígitos) ", totalClientes+1, ": ")
            		leia(senha[totalClientes])

            		escreva("Cadastre o telefone do Cliente: ")
            		leia(telefoneCliente[totalClientes])

            		escreva("Cadastre o e-mail do Cliente: ")
            		leia(emailCliente[totalClientes])

            		escreva("Valor do Projeto: ")
            		leia(valorProjeto[totalClientes])

            		escreva("Status do Pagamento: ")
            		leia(statusPagamento[totalClientes])

            		

            		
            		

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
      		escreva("\nLogin: ", login[i])
      		escreva("\nSenha: ", senha[i])

		}
		}
		
		se(opcao == 3){
			escreva("Digite o Login: ")
			leia(loginBusca)

			logico encontrado = falso

			para(i = 0; i < totalClientes; i++){

			se(loginBusca == login[i]){
				escreva("\nUsuário encontrado!")
				escreva("\nLogin: ", login[i])
				escreva("\nSenha: ", senha[i])

				encontrado = verdadeiro

				pare
			}
			}
		
		
			se(encontrado == falso){
				escreva("\nUsuário não encontrado!")
			}
				
		}	

		

			se(opcao == 4){
   				escreva("Digite o Login que deseja excluir: ")
   				leia(loginExcluir)

   				logico encontrado = falso

   				para(i = 0; i < totalClientes; i++){

      			se(loginExcluir == login[i]){
        				escreva("\nUsuário encontrado!")
        				escreva("\nLogin: ", login[i])
         				escreva("\nSenha: ", senha[i])

         				encontrado = verdadeiro

         				escreva("\nDigite 'CONFIRMAR' para excluir usuário: ")
         				leia(confirmar)

         			se(confirmar == "CONFIRMAR" ou confirmar == "confirmar" ou confirmar == "Confirmar"){
            		para(j = i; j < totalClientes - 1; j++){
               		login[j] = login[j+1]
               		senha[j] = senha[j+1]

            }

            			totalClientes--

            			escreva("\nUsuário excluído com sucesso!")

            			pare

         }

      }

   }

   				se(encontrado == falso){
      			escreva("\nUsuário não encontrado!")

   }

}
  			

  			
				

				se(opcao == 5){
    					escreva("\nDigite o Login que deseja alterar: ")
    					leia(loginAlterar)

    					logico encontrado = falso
    					inteiro a

    					para(i = 0; i < totalClientes; i++){

        				se(loginAlterar == login[i]){

            				encontrado = verdadeiro

            				escreva("\nUsuário encontrado!")
            				escreva("\nLogin: ", login[i])
            				escreva("\nSenha: ", senha[i])

            				escreva("\nDigite 'ALTERAR' para confirmar: ")
            				leia(alterar)

           		 	se(alterar == "ALTERAR" ou alterar == "alterar" ou alterar == "Alterar"){
		
                			escreva("\nNovo login: ")
               			leia(loginNew)

               			 logico existe = falso

                // 🔥 LOOP SÓ PRA VERIFICAR
               			para(a = 0; a < totalClientes; a++){
                    			se(loginNew == login[a] e a != i){
                        				existe = verdadeiro
                   				 }
               			 }

                // 🔥 DECISÃO FORA DO LOOP
                			se(existe == verdadeiro){
                    			escreva("\nUsuário já cadastrado!")

                    			
               			}senao{

                    			escreva("\nNova senha: ")
                    			leia(senhaNew)

                    			login[i] = loginNew
                    			senha[i] = senhaNew

                    			escreva("\nUsuário alterado com sucesso!")
                		}
            		}

            				pare
        }
    }

    						se(encontrado == falso){
        						escreva("\nUsuário não encontrado!")
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
 * @POSICAO-CURSOR = 3727; 
 * @PONTOS-DE-PARADA = ;
 * @SIMBOLOS-INSPECIONADOS = ;
 * @FILTRO-ARVORE-TIPOS-DE-DADO = inteiro, real, logico, cadeia, caracter, vazio;
 * @FILTRO-ARVORE-TIPOS-DE-SIMBOLO = variavel, vetor, matriz, funcao;
 */