import passportJwt from 'passport-jwt';
import { rUser } from '#repos';
import config from './config.js';

const { ExtractJwt, Strategy: JWTStrategy } = passportJwt;

const AUTH_ERRORS = {
  UNAUTHORIZED: {
    code: 'ERR_UNAUTHORIZED',
    message: 'Требуется авторизация',
  },
  INVALID_TOKEN: {
    code: 'ERR_UNAUTHORIZED',
    message: 'Невалидный токен',
  },
  INTERNAL: {
    code: 'ERR_INTERNAL',
    message: 'Ошибка аутентификации',
  },
};

export async function prepareUser(userId) {
  const user = await rUser.findByIdWithRoles(userId);

  if (!user) return null; 

  const roles = user.roles.map((role) => role.keyWord);
  const primaryRole = roles[0]; 

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    middleName: user.middleName,
    roles,
    role: primaryRole,
    keyWord: primaryRole,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export default (passport) => {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
    secretOrKey: config.jwtSecret,
  };

  passport.use(new JWTStrategy(opts, async (jwtPayload, done) => {
    try {
      const user = await prepareUser(jwtPayload.userId);
      
      if (!user) {
        return done(null, false);
      }
      
      return done(null, user);
    } catch (error) {
      console.error('JWT Strategy error:', error);
      return done(error, false);
    }
  }));

  return {
    initialize() {
      return passport.initialize();
    },
    
    authenticate(req, res, next) {
      const authHeader = req.headers.authorization || '';
      const [scheme, token] = authHeader.split(' ');

      if (!token || scheme !== 'JWT') {
        return res.status(401).json({ error: AUTH_ERRORS.UNAUTHORIZED });
      }
      
      passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err) {
          console.error('Passport authentication error:', err);
          return res.status(500).json({ error: AUTH_ERRORS.INTERNAL });
        }
        
        if (!user) {
          return res.status(401).json({ error: AUTH_ERRORS.INVALID_TOKEN });
        }

        req.user = user;
        req.context = req.context || {};
        req.context.user = user;
        
        next();
      })(req, res, next);
    },
  };
};