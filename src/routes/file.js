import cUploadImage from '#controllers/file/uploadImage.js';

export default [
  {
    path: '/files/v1/uploadImage',
    verb: 'post',
    handler: cUploadImage,
    authedOnly: true,
    upload: true,
  },
];