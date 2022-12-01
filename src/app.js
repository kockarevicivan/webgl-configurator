// Libraries
require('dotenv').config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');
const winston = require('winston');

// Constants
const app = express();
const isDevelopmentModeOn = true;
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        // Write all logs with importance level of `error` or less to `error.log` and all logs with importance level of `info` or less to `combined.log`.
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

app.set('views', 'src/views');
app.set('view engine', 'jsx');
app.engine('jsx', require('express-engine-jsx'));
app.use(bodyParser.json())
app.use(fileUpload());

app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'scss'),
    dest: path.join(__dirname, '../public/css'),
    sourceMap: isDevelopmentModeOn,
    outputStyle: 'compressed',
    prefix: '/css',
    debug: isDevelopmentModeOn
}));

app.use(express.static('public'))
app.get('/', (req, res) => res.render('home'));

// 500 Handler
app.use((err, req, res, next) => {
    logger.log({
        level: 'error',
        message: err.message,
    });

    res.status(500).render('error/500');
});

// 404 Handler
app.get('*', (req, res) => res.status(404).render('error/404'));

app.listen(process.env.PORT || 3000, () => console.log(`App running on: http://localhost:${process.env.PORT || 3000}`));
