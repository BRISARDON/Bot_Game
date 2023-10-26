// const express = require('express');
// const bodyParser = require('body-parser');
// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// app.post('/webhook', (req, res) => {
 // const messageBody = req.body.Body;

  // / lógica para responder automáticamente
//   let response = 'Mensaje por defecto';

 //  if (messageBody.toLowerCase() === 'jugar') {
 //    response = 'Ok';
 //  }

  // Enviar la respuesta al cliente
 //  res.set('Content-Type', 'text/plain');
 //  res.send(response);
// });

// app.listen(PORT, () => {
 //  console.log(`Servidor escuchando en el puerto ${PORT}`);
// });


const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
const fetch = require('node-fetch');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let currentQuestion = null;

app.post('/webhook', async (req, res) => {
  if (req.body && req.body.Body) {
    const messageBody = req.body.Body.toLowerCase();

    if (currentQuestion) {
      // El usuario ya está jugando, verifica su respuesta
      if (messageBody === currentQuestion.correctAnswer.toLowerCase()) {
        res.set('Content-Type', 'text/plain');
        res.send('¡Respuesta correcta!');
      } else {
        res.set('Content-Type', 'text/plain');
        res.send('Respuesta incorrecta. La respuesta correcta es: ' + currentQuestion.correctAnswer);
      }

      // Reinicia la pregunta actual
      currentQuestion = null;
    } else if (messageBody === 'jugar') {
      try {
        // Obtiene una nueva pregunta de trivia desde la API de Open Trivia DB
        currentQuestion = await getTriviaQuestion();

        if (!currentQuestion) {
          res.set('Content-Type', 'text/plain');
          res.send('No se pudieron obtener preguntas de trivia.');
          return;
        }

        // Envía la pregunta y opciones de respuesta al cliente
        res.set('Content-Type', 'text/plain');
        res.send(`Pregunta: ${currentQuestion.question}\nOpciones:\n${currentQuestion.options.join('\n')}`);
      } catch (error) {
        console.error('Error al obtener preguntas de trivia', error);
        res.set('Content-Type', 'text/plain');
        res.send('Ocurrió un error al obtener preguntas de trivia.');
      }
    } else {
      res.set('Content-Type', 'text/plain');
      res.send('Envía "jugar" para obtener una pregunta de trivia.');
    }
  } else {
    // Maneja el caso en el que req.body.Body no está definido
    res.set('Content-Type', 'text/plain');
    res.send('Mensaje inesperado desde WhatsApp');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Función para obtener una pregunta de trivia desde la API de Open Trivia DB
async function getTriviaQuestion() {
  const apiUrl = 'https://opentdb.com/api.php?amount=1&type=multiple&language=es'; // Puedes ajustar las opciones aquí
  const response = await fetch(apiUrl);
  const data = await response.json();
  
  if (data.results && data.results.length > 0) {
    const questionData = data.results[0];
    const question = questionData.question;
    const correctAnswer = questionData.correct_answer;
    const incorrectAnswers = questionData.incorrect_answers;
    const options = [...incorrectAnswers, correctAnswer];
    
    // Mezcla las opciones en un orden aleatorio
    options.sort(() => Math.random() - 0.5);
    
    return {
      question,
      options,
      correctAnswer,
    };
  } else {
    return null;
  }
}