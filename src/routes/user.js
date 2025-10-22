import cUpdateUserRoles from '#controllers/user/update.js';

export default [
  {
    path: '/users/v1/:id/roles',
    verb: 'put',
    handler: cUpdateUserRoles,
    authedOnly: true,
  },
];