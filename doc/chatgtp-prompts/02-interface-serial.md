# Crie um exemplo utilizando a linguagem javascript do nodejs que abre uma conexão tcp na porta 4001 e envia ciclicamente ao cliente conectado o valor de uma variável numérica denominada pesoBruto

A variável pesoBruto representa o peso em kg de uma balança e é atualizado e enviado para o cliente a cada 100 milisegundos.
O valor inicial de pesoBruto é de 0.0 kg.
O valor de pesoBruto pode variar de -20.0 a 1500.0 kg.

O valor da constante taxaDosagemFina é 4.38 kg/ms.
O valor da constante taxaDosagemGrossa é 4.38 kg/ms.
O valor da constante taxaDescarga é 27.17 kg/ms.

Deverão existir 3 variáveis denominadas dosagemFinaAtiva, dosagemGrossaAtiva e descargaAtiva, que serão iniciadas com valor false.

A cada ciclo de atualização e envio de peso deverão ser verificados os valores das variáveis dosagemFinaAtiva, dosagemGrossaAtiva e descargaAtiva e realizado o seguinte:

1. Quando o valor de dosagemFinaAtiva for true deverá somar o valor de taxaDosagemFina ao valor da variável pesoBruto;
2. Quando o valor de dosagemGrossaAtiva for true deverá somar o valor de taxaDosagemGrossa ao valor da variável pesoBruto;
3. Quando o valor de descargaAtiva for true deverá subtrair o valor de taxaDescarga ao valor da variável pesoBruto;
4. Não havendo nenhuma alteração em pesoBruto, enviar ao cliente conectado o valor inalterado;

A conexão do cliente terá um tempo de timeout de 3000 milisegundos. O cliente enviará ao servidor uma string contendo os caracteres "pingNOP\r\n" (0x70 0x69 0x6E 0x67 0x4E 0x4F 0x50 0x0D 0x0A). Quando recebida essa string o temporizador de timeout deverá ser reiniciado. Quando o temporizador atingir o setpoint a conexão com o cliente deverá ser encerrada.
