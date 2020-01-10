// Express.js
const Express = require('express');
const path = require('path');

// Setting up express
const expressApp = Express();
const port = process.env.PORT || 80;

expressApp.set('view engine', 'pug');
expressApp.set('views', './views');
expressApp.get('/', (request, response) => {
  response.render('index', {
    title: 'Valkyrie',
    message: 'Index'
  });
});

const server = expressApp.listen(port, () =>
  console.log(`expressApp listening on port ${port}!`)
);
