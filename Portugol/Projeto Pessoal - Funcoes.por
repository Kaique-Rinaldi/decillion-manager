programa
{
funcao mostrarMenu(){
	

   escreva("\n\n=====DECILLION MANAGER=====")
   escreva("\n\n1 - Cadastrar Cliente")
   escreva("\n2 - Listar Clientes")
   escreva("\n3 - Buscar Cliente")
   escreva("\n4 - Excluir Cliente")
   escreva("\n5 - Alterar Cliente")
   escreva("\n99 - Sair")
   escreva("\nEscolha uma opção: ")
   

}
	
	funcao inicio()
	{
		inteiro opcao
		inteiro totalClientes = 0
		cadeia login[5]
		cadeia senha[5]
		inteiro i
		cadeia loginBusca
		cadeia loginExcluir
		cadeia confirmar, alterar
		inteiro j
		cadeia loginAlterar
		cadeia loginNew, senhaNew
		




	///MENU
		faca{
			mostrarMenu()
			leia(opcao)
		

	///ENTRADA DE DADOS

		se(opcao == 1){
			se(totalClientes < 5){
				escreva("Cadastre seu Login ", totalClientes+1, ": ")
				leia(login[totalClientes])
				escreva("Cadastre sua Senha ", totalClientes+1, ": ")
				leia(senha[totalClientes])
				totalClientes++
				
			}
		}
		

		se(opcao == 2){
			escreva("\nExiste um total de ", totalClientes, " clientes")
			
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

   					para(i = 0; i < totalClientes; i++){

      				se(loginAlterar == login[i]){
         					escreva("\nUsuário encontrado!")
         					escreva("\nLogin: ", login[i])
         					escreva("\nSenha: ", senha[i])

         					encontrado = verdadeiro

         					escreva("\nDigite 'ALTERAR' para confirmar alteração dos dados: ")
         					leia(alterar)

         				se(alterar == "ALTERAR" ou alterar == "alterar" ou alterar == "Alterar"){
            				escreva("\nCadastre um novo Login: ")
            				leia(loginNew)

            				escreva("\nCadastre uma nova Senha: ")
            				leia(senhaNew)

            				login[i] = loginNew
            				senha[i] = senhaNew

            				escreva("\nUsuário alterado com sucesso!")

           				pare

         }

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
 * @POSICAO-CURSOR = 3523; 
 * @PONTOS-DE-PARADA = ;
 * @SIMBOLOS-INSPECIONADOS = ;
 * @FILTRO-ARVORE-TIPOS-DE-DADO = inteiro, real, logico, cadeia, caracter, vazio;
 * @FILTRO-ARVORE-TIPOS-DE-SIMBOLO = variavel, vetor, matriz, funcao;
 */