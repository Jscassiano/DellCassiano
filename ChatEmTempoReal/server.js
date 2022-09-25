const express = require('express')
const path = require('path')
const { fileURLToPath } = require('url')


// Conexão com o servidor 
const app = express()
app.set('port', (process.env.PORT || 3000));
var server = app.listen(app.get('port'), function () {
  console.log('Server Rodando na porta', app.get('port'));
});



const io = require('socket.io')(server)

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')



app.get('/', (req, res) => {
  res.render('index.html')
})

//As mensagen estão salvas em memória, enquanto o servidor estiver aberto ele vai
//e se fechar ele zera tudo!!!
let messagem = [];

let users = [];

//Conecta o socket
io.on('connection', socket => {


  users.push(socket.id)

  console.log(users)

  console.log(`Server conectado: ${socket.id}`);

  //Carregando nmensagens no reload
  socket.emit('previusMessages', messagem)

  //Carregando no front a quantidade de usuarios
  socket.emit('users', users)

  //Eitindo para o front as a quantidade de usuario
  socket.broadcast.emit('recivedUsers', users)


  //Enviando as mensagens para o front
  socket.on('sendMessage', data => {
    //Colocando os a dados da mensagem no front
    messagem.push(data)
    socket.broadcast.emit('receivedMessage', data)
  });

  
  // Enviar para o Front se o usuario desconectar
  socket.emit('usersLogOut', users)
  socket.broadcast.emit('recivedUsersLogOut', users)



  // Remove o usuário da contagem total
  users.splice(users.indexOf(socket.id), 1);


  // Detecta que o usuário desconectou
  socket.on('disconnect', function (data) {
    console.log('user ' + data + ' disconnected');



    console.log(data)

  });
});

