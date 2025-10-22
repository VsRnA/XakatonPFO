import passportJwt from 'passport-jwt';
import { rUser } from '#repos';
import config from './config.js';

const ExtractJWT = passportJwt.ExtractJwt;
const JWTStrategy = passportJwt.Strategy;

export async function prepareUser(userId) {
  const user = await rUser.findByIdWithRoles(userId);

  if (!user) return false;

  const roles = user.roles.map((role) => role.keyWord);
  const role = roles[0]; 

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    middleName: user.middleName,
    roles,
    role,
    keyWord: role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export default (passport) => {
  const opts = {};
  opts.jwtFromRequest = ExtractJWT.fromAuthHeaderWithScheme('JWT');
  opts.secretOrKey = config.jwtSecret;

  passport.use(new JWTStrategy(opts, async (jwtPayload, done) => {
    try {
      const userId = jwtPayload.userId;
      const user = await prepareUser(userId);
      
      if (!user) {
        return done(null, false);
      }
      
      done(null, user);
    } catch (error) {
      console.error('JWT Strategy error:', error);
      done(error, false);
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
        return res.status(401).json({
          error: {
            code: 'ERR_UNAUTHORIZED',
            message: 'Требуется авторизация',
          },
        });
      }
      
      passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
          console.error('Passport authentication error:', err);
          return res.status(500).json({
            error: {
              code: 'ERR_INTERNAL',
              message: 'Ошибка аутентификации',
            },
          });
        }
        
        if (!user) {
          return res.status(401).json({
            error: {
              code: 'ERR_UNAUTHORIZED',
              message: 'Невалидный токен',
            },
          });
        }

        // Устанавливаем пользователя в req.user (стандарт Passport)
        req.user = user;
        
        // Также устанавливаем в req.context для вашей архитектуры
        if (!req.context) {
          req.context = {};
        }
        req.context.user = user;
        
        next();
      })(req, res, next);
    },
  };
};