import { rRole } from '#repos';
import { ValidationError, ConflictError } from '#errors';

export default async (request) => {
  const { name, keyWord, description } = request.payload;

  if (!name || !keyWord) {
    throw new ValidationError('Поля "name" и "keyWord" обязательны');
  }

  const keyWordPattern = /^[a-z_]+$/;
  if (!keyWordPattern.test(keyWord)) {
    throw new ValidationError('Поле "keyWord" может содержать только латинские буквы в нижнем регистре и символ "_"');
  }

  const existingRole = await rRole.findByKeyWord(keyWord);
  if (existingRole) {
    throw new ConflictError(`Роль с ключом "${keyWord}" уже существует`);
  }

  const role = await rRole.create({
    name,
    keyWord,
    description: description || null,
  });

  return role;
};
