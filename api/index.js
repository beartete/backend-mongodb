import express from 'express'

const app = express()
const port = 4001
//import das rotas da aplicação
import rotasPrestadores from './routes/prestador.js'
import rotasUsuarios from './routes/usuario.js'

app.use(express.json()) // irá fazer o parse de arquivos JSON
//Rotas de conteúdo público
app.use('/', express.static('public'))

//configurra o favicon
app.use('/favicon.ico', express.static('public/images/computer.png'))

app.use('/api/prestadores', rotasPrestadores)

//Rotas da API
app.get('/api', (req, res) => {
    res.status(200).json({
        message: 'API Fatec 100% funcional ',
        version: '1.0.1'
    })
})
//Rotas de Exceção - deve ser a última!
app.use(function (req, res) {
    res.status(404).json({
        errors: [{
            value: `${req.originalUrl}`,
            msg: `A rota ${req.originalUrl} não existe nesta API`,
            param: 'invalid routa'
        }]
    })
})

app.listen(port, function(){
    console.log(`Servidor rodando na porta ${port}`)
})