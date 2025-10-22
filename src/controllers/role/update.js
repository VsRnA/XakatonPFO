import { rRole } from '#repos';
import { ValidationError, NotFoundError, ConflictError } from '#errors';

export default async (request) => {
  const { id } = request.params;
  const { name, keyWord, description } = request.payload;

  if (!id || isNaN(id)) {
    throw new ValidationError('Некорректный идентификатор роли');
  }

  if (!name && !keyWord && description === undefined) {
    throw new ValidationError('Необходимо указать хотя бы одно поле для обновления');
  }

  const role = await rRole.findById(parseInt(id));
  if (!role) {
    throw new NotFoundError(`Роль с ID ${id} не найдена`);
  }

  if (keyWord && keyWord !== role.keyWord) {
    const keyWordPattern = /^[a-z_]+$/;
    if (!keyWordPattern.test(keyWord)) {
      throw new ValidationError('Поле "keyWord" может содержать только латинские буквы в нижнем регистре и символ "_"');
    }

    const existingRole = await rRole.findByKeyWord(keyWord);
    if (existingRole) {
      throw new ConflictError(`Роль с ключом "${keyWord}" уже существует`);
    }
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (keyWord) updateData.keyWord = keyWord;
  if (description !== undefined) updateData.description = description;

  await rRole.update(parseInt(id), updateData);

  const updatedRole = await rRole.findById(parseInt(id));
  return updatedRole;
};
