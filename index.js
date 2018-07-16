const app = require('./app');

app.set('port', 3000);
app.listen(app.get('port'), () => console.log(`Express app listening on localhost:${app.get('port')}`));
