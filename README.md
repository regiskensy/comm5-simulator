# **comm5-simulator**

## Simulador de módulos Comm5 MA (balanças) para sistema de carregamento ferroviário SLoader

Este app simula 14 módulos Comm5 MA, com interfaces de controle de relés e interfaces seriais, para operação do sistema de carregamento rodoviário SLoader sem a necessidade de estar conectado à infraestrutura física de campo. Com isso é possível realizar testar alterações de sistema, realizar treinamento operacional, apresentação comercial do produto, entre outros procedimentos.

As as interfaces seriais são emuladas nas portas 4001 à 4014 enquanto as interfaces de relé são emuladas nas portas 5001 à 5014.
O peso da balança é enviado ciclicamente por cada interface serial, apresentanto um comportamento de incremento e decremento conforme comandos enviados para as respectivas interfaces de relé.

Para cada interface de relé são considerados 3 canais, sendo:

- Canal 1: Válvula de dosagem fina;
- Canal 2: Válvula de dosagem grossa;
- Canal 3: Válvula de descarga;

A taxa de incremento de peso (carga) e decremento de peso (descarga) seguem parâmetros de tempo conforme análise do comportamento das balanças em campo.
