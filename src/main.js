const net = require('net')

const TIMEOUT_CONEXAO = process.env.TIMEOUT_CONEXAO || 1000 * 3
const PORTA_INTERFACE_ACIONAMENTO = process.env.PORTA_INTERFACE_ACIONAMENTO || 5000
const PORTA_INTERFACE_SERIAL = process.env.PORTA_INTERFACE_SERIAL || 4001
const TEMPO_CICLO_PESO = process.env.TEMPO_CICLO_PESO || 100
const PESO_MINIMO = process.env.PESO_MINIMO || 0.0
const PESO_MAXIMO = process.env.PESO_MAXIMO || 1500.0
const TAXA_DOSAGEM_FINA = process.env.TAXA_DOSAGEM_FINA || 4.38 // kg/ms
const TAXA_DOSAGEM_GROSSA = process.env.TAXA_DOSAGEM_GROSSA || 4.38 // kg/ms
const TAXA_DESCARGA = process.env.TAXA_DESCARGA || 27.17 // kg/ms

// Armazena o estado atual dos relés
let estadoRele = [false, false, false, false, false, false, false, false]

// Armazena o de peso bruto
let pesoBruto = 0.0 // kg

// Atualiza o peso bruto ciclicamente
setInterval(() => {
  let dosagemFinaAtiva = estadoRele[0] // Relé de dosagem fina
  let dosagemGrossaAtiva = estadoRele[1] // Relé de dosagem grossa
  let descargaAtiva = estadoRele[2] // Relé de descarga

  // Atualiza o peso bruto de acordo com as taxas de dosagem e descarga
  if (dosagemFinaAtiva) {
    pesoBruto += TAXA_DOSAGEM_FINA
  }

  if (dosagemGrossaAtiva) {
    pesoBruto += TAXA_DOSAGEM_GROSSA
  }

  if (descargaAtiva) {
    pesoBruto -= TAXA_DESCARGA
  }

  // Define limites de paso
  if (pesoBruto < PESO_MINIMO) {
    pesoBruto = PESO_MINIMO
  }

  if (pesoBruto > PESO_MAXIMO) {
    pesoBruto = PESO_MAXIMO
  }
}, TEMPO_CICLO_PESO)

// Função para gerar o buffer com os dados de peso
function gerarBuffer(peso) {
  // Formata o valor do peso para sempre ter 7 caracteres
  let pesoString = Math.abs(peso).toFixed(2).padStart(7, '0')

  // formata a string adicionando o sinal de menos na primeira posição
  if (peso < 0) {
    pesoString = '-' + pesoString.substring(1)
  }

  strBuffer = `WG${pesoString}kg`

  return strBuffer
}

function gerarCRC(strBuffer) {
  let crc = 0

  // Calcula o CRC-8 XOR com o polinômio gerador atual
  // Equação polinomial (0x2A): x^8 + x^6 + x^3 + x^2 + x + 1
  for (let i = 0; i < 11; i++) {
    let byteval = strBuffer.charCodeAt(i)
    let crcval = crc ^ byteval

    for (let j = 0; j < 8; j++) {
      let bitval = crcval & 1
      crcval = crcval >> 1
      if (bitval === 1) {
        crcval = crcval ^ 0x2a
      }
    }

    crc = crcval
  }

  // Converte o resultado do CRC-8 XOR em uma string
  let crcStr = crc.toString(16).toUpperCase()

  if (crcStr.length < 2) {
    crcStr = '0' + crcStr
  }

  //return strBuffer.slice(0, -4) + crcStr;
  return `${strBuffer}${crcStr}\r\n`
}

// Cria o servidor TCP na porta 5000 para receber os comandos dos relés
const serverAcionamentos = net.createServer(socket => {
  console.log(`Cliente conectado à porta ${PORTA_INTERFACE_ACIONAMENTO}`)

  let msgTimeoutConexao = `Timeout de conexão na porta ${PORTA_INTERFACE_ACIONAMENTO}`

  // Cria um temporizador para timeout de conexão
  let timerId = setTimeout(() => {
    console.log(msgTimeoutConexao)
    socket.end()
  }, TIMEOUT_CONEXAO)

  // Trata evento de recebimento de dados
  socket.on('data', data => {
    // Reseta temporizador de timeout sempre que receber dados
    clearTimeout(timerId)

    timerId = setTimeout(() => {
      console.log(msgTimeoutConexao)
      socket.end()
    }, TIMEOUT_CONEXAO)

    const comando = data.toString().trim()

    console.log(
      `Comando "${comando}" recebido na porta ${PORTA_INTERFACE_ACIONAMENTO}`
    )

    // Verifica se o comando recebido é válido
    if (/^OUT [0-9A-F]{2}$/i.test(comando)) {
      // Busca o valor em hex presente no comando
      const valorHex = comando.substr(4, 2)

      // Converte valor em hex para binário em forma de string
      const valorBin = parseInt(valorHex, 16).toString(2).padStart(8, '0')

      // Atualiza o estado dos relés conforme comando recebido
      for (let i = 0; i < estadoRele.length; i++) {
        estadoRele[7 - i] = valorBin[i] === '1'
      }

      // Envia a resposta positiva
      socket.write('210 OK\r\n')
    } else {
      // Envia resposta negativa
      socket.write('410 Bad pin\r\n')
    }
  })

  // Trata evento de desconexão
  socket.on('end', () => {
    console.log(`Cliente desconectado da porta ${PORTA_INTERFACE_ACIONAMENTO}`)
  })
})

// Executa interface de acionamentos
serverAcionamentos.listen(PORTA_INTERFACE_ACIONAMENTO, () => {
  console.log(`Servidor TCP iniciado na porta ${PORTA_INTERFACE_ACIONAMENTO}`)
})

// Cria o servidor TCP na porta 4001 para consulta do peso bruto
const serverSerial = net.createServer(socket => {
  console.log(`Cliente conectado à porta ${PORTA_INTERFACE_SERIAL}`)

  let msgTimeoutConexao = `Timeout de conexão na porta ${PORTA_INTERFACE_SERIAL}`

  // Cria um temporizador para timeout de conexão
  let timerId = setTimeout(() => {
    console.log(msgTimeoutConexao)
    socket.end()
  }, TIMEOUT_CONEXAO)

  // Trata evento de recebimento de comando
  socket.on('data', data => {
    // Reseta temporizador de timeout da conexão
    clearTimeout(timerId)

    timerId = setTimeout(() => {
      console.log(msgTimeoutConexao)
      socket.end()
    }, TIMEOUT_CONEXAO)

    const comando = data.toString().trim()

    console.log(
      `Comando "${comando}" recebido na porta ${PORTA_INTERFACE_SERIAL}`
    )
  })

  // Envia ciclicamente o valor atualizado do peso bruto
  let intervalId = setInterval(() => {
    // Verifica se existe um client conectado
    if (socket.writable) {
      //socket.write(`${pesoBruto.toFixed(1)} kg\n`);

      // Envia peso
      socket.write(gerarCRC(gerarBuffer(pesoBruto)))
    }
  }, TEMPO_CICLO_PESO)

  // Trata evento de desconexão
  socket.on('end', () => {
    clearInterval(intervalId)
    console.log('Cliente desconectado da porta 4001.')
  })
})

// Executa interface serial
serverSerial.listen(PORTA_INTERFACE_SERIAL, () => {
  console.log(`Servidor TCP iniciado na porta ${PORTA_INTERFACE_SERIAL}`)
})

// Trata evento de encerramento do app
process.on('exit', code => {
  console.log(`Processo com Id ${process.pid} encerrado com código ${code}`)
})

function encerramentoGracioso(code) {
  console.log(`Encerrando processo ${process.pid} com código ${code}`)

  console.log(`Encerrando servidor TCP iniciado na porta ${PORTA_INTERFACE_ACIONAMENTO}`)
  serverAcionamentos.close()

  console.log(`Encerrando servidor TCP iniciado na porta ${PORTA_INTERFACE_SERIAL}`)
  serverSerial.close()

  process.exit(0)
}

process.on('SIGTERM', code => {
  encerramentoGracioso(code)
})

// Escreve Id do processo
console.log(`Iniciando processo com Id ${process.pid}`)
