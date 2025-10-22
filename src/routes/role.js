import cCreateRole from '#controllers/role/create.js';
import cGetRole from '#controllers/role/get.js'
import cListRoles from '#controllers/role/list.js';
import cUpdateRole from '#controllers/role/update.js';
import cDeleteRole from '#controllers/role/delete.js';

export default [
  {
    path: '/role/v1',
    verb: 'post',
    handler: cCreateRole,
    authedOnly: false,
  },
  {
    path: '/role/v1/list',
    verb: 'get',
    handler: cListRoles,
    authedOnly: true,
  },
  {
    path: '/role/v1/:id',
    verb: 'put',
    handler: cUpdateRole,
    authedOnly: true,
  },
  {
    path: '/role/v1/:id',
    verb: 'delete',
    handler: cDeleteRole,
    authedOnly: true,
  },
  {
    path: '/role/v1/:id',
    verb: 'get',
    handler: cGetRole,
    authedOnly: true,
  },
];