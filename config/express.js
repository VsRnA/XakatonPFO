import httpModule from 'http';
import express from 'express';
import passport from 'passport';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import createExpressGateway from '#infrastructure/express.js';
import auth from './passport.js';


const authorization = auth(passport);
const app = express();

const http = httpModule.createServer(app);

app.use(cors());

app.use(bodyParser.json({
  parameterLimit: 204800,
  limit: '20mb',
}));
app.use(bodyParser.urlencoded({
  parameterLimit: 204800,
  limit: '20mb',
  extended: true,
}));
app.use(cookieParser());

app.use(authorization.initialize());

app.use('/', createExpressGateway());

export default http;
