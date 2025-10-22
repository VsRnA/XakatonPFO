import cCreateLottery from '#controllers/lottery/create.js';
import cGetLotteryImage from '#controllers/lottery/getLotteryImage.js';

export default [
  {
    path: '/lottery/v1',
    verb: 'post',
    handler: cCreateLottery,
    authedOnly: true,
    upload: true,
  },
  {
    path: '/lottery/v1/:id/image',
    verb: 'get',
    handler: cGetLotteryImage,
    authedOnly: true, 
  },
];