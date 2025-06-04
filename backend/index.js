const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const users = require('./users');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = 'secretkey123';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('../frontend'));

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Usuário ou senha incorretos' });

  const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '1h' });
  res.json({ token, role: user.role, username: user.username });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token não encontrado' });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = user;
    next();
  });
}

app.get('/userdata', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

  res.json({ id: user.id, username: user.username, role: user.role });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});