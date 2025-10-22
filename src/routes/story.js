import cGetStory from '#controllers/story/get.js';

export default [
  {
    path: '/story/v1/algorithm',
    verb: 'get',
    handler: cGetStory,
    authedOnly: false,
  },
];