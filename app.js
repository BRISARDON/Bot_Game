const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
  const messageBody = req.body.Body;

  // lógica para responder automáticamente
  let response = 'Mensaje por defecto';

  if (messageBody.toLowerCase() === 'jugar') {
    response = 'Ok';
  }

  // Enviar la respuesta al cliente
  res.set('Content-Type', 'text/plain');
  res.send(response);
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});