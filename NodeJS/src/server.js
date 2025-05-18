// import express from 'express';
// import dotenv from 'dotenv';
// import configViewEngine from './configs/viewEngine.js';
// import initWebRoute from './route/webRoute.js';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import bodyParser from 'body-parser';
// import RedisStore from "connect-redis"
// import session from 'express-session'
// import {createClient} from "redis"
// import cors from 'cors';
// import cookieParser from 'cookie-parser'
// // import userRouter from './route/webRoute.js';
// // Lấy đường dẫn của tệp hiện tại
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();
// dotenv.config();

// const port = process.env.PORT;

// // Initialize client.
// let redisClient = createClient()
// redisClient.connect().catch(console.error)

// // Initialize store.
// let redisStore = new RedisStore({
//   client: redisClient,
//   prefix: "myapp:",
// })

// // Initialize session storage.
// app.use(
//     session({
//       store: redisStore,
//       resave: false,
//       saveUninitialized: false,
//       secret: "keyboard cat",
//       cookie: { 
//         secure: false, 
//         maxAge: 2 * 60 * 60 * 1000 // 2 giờ
//       }
//     })
//   );

// app.use(cors({
//     origin: 'http://localhost:3000', 
//     optionsSuccessStatus: 200,
//     credentials: true 
// }));

// app.use(bodyParser.urlencoded({ extended: true }))
// app.use(bodyParser.json())
// app.use(cookieParser())
// // Routes
// // app.use('/api', userRouter);
// configViewEngine(app);
// // // API lấy thông tin user
// app.get('/api/getUser', (req, res) => {
//     if (req.session.user) {
//         res.status(200).json({ user: req.session.user });
//     } else {
//         res.status(401).json({ message: 'User not authenticated' });
//     }
// });
//     // // API đăng xuất
//     // app.post('/api/logout', (req, res) => {
//     //     res.clearCookie('jwt'); // Xóa cookie JWT
//     //     req.session.destroy((err) => {
//     //         if (err) {
//     //             return res.status(500).json({ message: 'Error logging out' });
//     //         }
//     //         res.clearCookie('connect.sid');  // Xóa cookie session
//     //         res.status(200).json({ message: 'Logged out successfully' });
//     //     });
//     // });

    
// // app.use(express.static(path.join(__dirname, 'uploads')));
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// console.log(path.join(__dirname, 'uploads'));
// initWebRoute(app);
// app.listen(port, () => {
//     console.log(`Example app listening on port ${port}`);
// });
import express from 'express';
import dotenv from 'dotenv';
import configViewEngine from './configs/viewEngine.js';
import initWebRoute from './route/webRoute.js';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import RedisStore from "connect-redis";
import session from 'express-session';
import { createClient } from "redis";
import cors from 'cors';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
dotenv.config();

const port = process.env.PORT;

let redisClient = createClient();
redisClient.connect().catch(console.error);

let redisStore = new RedisStore({
    client: redisClient,
    prefix: "myapp:",
});

app.use(session({
    store: redisStore,
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    cookie: { 
        secure: process.env.NODE_ENV === 'production', 
        httpOnly: true,
        path: '/',
        maxAge: 2 * 60 * 60 * 1000 // 2 giờ
    }
}));

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:4000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, '../Uploads')));
configViewEngine(app);
initWebRoute(app);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
