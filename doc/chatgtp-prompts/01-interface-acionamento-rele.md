# Crie um exemplo utilizando a linguagem javascript do nodejs para simular o funcionamento de um módulo de acionamento marca Comm5 modelo MA-5100-2. O exemplo deve assumir o comportamento do módulo MA-5100-2

Esse módulo possui 1 interface de acionamento com 8 saídas a relé.

Os relés são acionados por meio de uma interface TCP acessível por meio da porta 5000. Nessa porta o módulo recebe comandos no seguinte formato:

1. Caracteres "OUT " (0x4F 0x55 0x54 0x20);
2. 2 caracteres representando o valor hexadecimal a ser enviado para 8 relés;
3. "carriage return" (0x0D);
4. "Line feed" (0x0A);

Seguem alguns exemplos de comandos:

1. Ligar apenas o relé 1: "OUT 01\r\n" (0x4F 0x55 0x54 0x20 0x30 0x31 0x0D 0x0A);
2. Ligar apenas o relé 2: "OUT 02\r\n" (0x4F 0x55 0x54 0x20 0x30 0x32 0x0D 0x0A);
3. Ligar apenas o relé 3: "OUT 04\r\n" (0x4F 0x55 0x54 0x20 0x30 0x34 0x0D 0x0A);
4. Ligar apenas o relé 4: "OUT 08\r\n" (0x4F 0x55 0x54 0x20 0x30 0x38 0x0D 0x0A);
5. Ligar os relés 1, 2, 3 e 4 simultaneamente: "OUT 0F\r\n" (0x4F 0x55 0x54 0x20 0x30 0x46 0x0D 0x0A);
6. Ligar todos os 8 relés: "OUT FF\r\n" (0x4F 0x55 0x54 0x20 0x46 0x46 0x0D 0x0A);

Sempre que o módulo recebe um comando válido na porta 5000 ele responde com a string "210 OK\r\n" (0x32 0x31 0x30 0x20 0x4F 0x4B 0x0D 0x0A).
Sempre que o módulo recebe um comando inválido na porta 5000 ele responde com a string "410 Bad pin\r\n" (0x34 0x31 0x30 0x20 0x42 0x61 0x64 0x20 0x70 0x69 0x6E 0x0D 0x0A).

No simulador deverá existir uma variável global chamada "estadoRele" do tipo array com 8 índices, onde cada índice deverá armazenar o valor boleano que representa o estado de cada relé, conforme último comando recebido pela porta 5000.
