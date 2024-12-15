const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const stream = require('./ws/stream');
const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videoRouter');
const translateRouter = require('./routes/translateRouter');
const flashcardRouter = require('./routes/flashcardRouter');
const profileRouter = require('./routes/profileRouter');
const topicRouter = require('./routes/topicRouter');
const socket = require('./controllers/socketController');

const app = express();
const server = http.Server(app);
const io = socketIO(server);

app.use(authRoutes);



// Middleware để parse body của request
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Cấu hình đường dẫn tĩnh
app.use(express.static('public'));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/public/dist', express.static(path.join(__dirname, 'public', 'dist')));
// app.use(express.static(path.join(__dirname, 'public', 'dist')));


// Cấu hình view engine là EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Định nghĩa các route
app.use('/auth', authRoutes);
app.use('/', videoRoutes);
app.use('/', translateRouter);
app.use('/', flashcardRouter);
app.use('/chat', videoRoutes);
app.use('/profile', profileRouter);
app.use('/', topicRouter);

// Route cho trang chủ để render login.ejs
app.get('/', (req, res) => {
    res.render('login', { title: 'Login' });
});

app.get('/', (req, res) => {
    res.render('register', { title: 'Register' });
});

app.get('/callVideo', (req, res) => {
    res.render('callVideo');
    // res.redirect('/callVideo');
});
app.get('/profile', (req, res) => {
    res.render('profile', { title: 'Profile' });
});
app.use((req, res, next) => {
    console.log(`Request URL: ${req.url}`);
    next();
});


// Cấu hình WebSocket
io.of('/stream').on('connection', stream);


// Khởi động server
const PORT = 3000;
server.listen(PORT, () => {
    socket(server);

    console.log(`Server is running on http://localhost:${PORT}`);
});