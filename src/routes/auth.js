import cRegistration from '#controllers/auth/registration.js';
import cLogin from '#controllers/auth/login.js';

export default [
  {
    path: '/auth/v1/registration',
    verb: 'post',
    handler: cRegistration,
    authedOnly: false,
  },
  {
    path: '/auth/v1/login',
    verb: 'post',
    handler: cLogin,
    authedOnly: false,
  },
];