const app = require('express')();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const { PORT = 5000 } = process.env;

app.use(bodyParser.json());

const dbUrl = "mongodb+srv://starlinkspacexuser:0vJ9hnxejF0vaiWm@cluster0.gxtne.mongodb.net/starlinkspacexdb?retryWrites=true&w=majority";
const dbClient = new MongoClient(dbUrl, { useNewUrlParser: true });
dbClient.connect(err => {
  if (err) throw err;
});

app.get('/', function (req, res) {
  res.send('Auth Service dev!')
})

const privateKey = fs.readFileSync(path.join(__dirname, 'private.key'));

async function retrieveUser(userId, password) {
  return new Promise(resolve => {
    dbClient.db('starlinkspacexdb').collection('administrators').find({ userId: userId, password: password }).toArray((err, objects) => {
      if (objects.length === 1) {
        resolve(objects[0]);
      } else {
        resolve(null);
      }
    });
  });
}

app.post('/auth-service/auth', async (req, res) => {
  const userId = req.body.userId;
  const password = req.body.password;
  const user = await retrieveUser(userId, password);

  console.log(`Auth: Authorizing user: ${userId}`);

  if (!user) {
    res.status(403).json({
      statusCode: 403,
      statusMessage: 'Access Denied',
      data: []
    });
    return;
  }
  let token;

  token = {
    jwtToken: jwt.sign({
      exp: Math.floor(Date.now() / 1000) + (60 * 60),
      privileges: user.privileges
    }, privateKey, { algorithm: 'RS256' })
  };

  res.status(200).send(token);
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

module.exports = app;
