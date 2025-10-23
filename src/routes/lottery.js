import cCreateLottery from '#controllers/lottery/create.js';
import cGetLottery from '#controllers/lottery/get.js';
import cListLotteries from '#controllers/lottery/list.js';
import cRegisterInLottery from '#controllers/userLottery/create.js'
import cCalculateWinners from '#controllers/userLottery/calculateWinners.js';
import cGetLotteryResultForUser from '#controllers/userLottery/get.js';
import cCalculateVerification from '#controllers/userLottery/calculateVerification.js';

export default [
  {
    path: '/lottery/v1',
    verb: 'post',
    handler: cCreateLottery,
    authedOnly: true,
    upload: true,
  },
  {
    path: '/lottery/v1',
    verb: 'get',
    handler: cListLotteries,
    authedOnly: true,
  },
  {
    path: '/lottery/v1/:id',
    verb: 'get',
    handler: cGetLottery,
    authedOnly: true,
  },
  {
    path: '/lottery/v1/register',
    verb: 'post',
    handler: cRegisterInLottery,
    authedOnly: true,
    upload: true,
  },
  {
    path: '/lottery/v1/calculateLotteryWinners',
    verb: 'post',
    handler: cCalculateWinners,
    authedOnly: true
  },
  {
    path: '/lottery/v1/:lotteryId/getUserLotteryResults',
    verb: 'get',
    handler: cGetLotteryResultForUser,
    authedOnly: true,
  },
  {
    path: '/lottery/v1/calculate-verification',
    verb: 'post',
    handler: cCalculateVerification,
    authedOnly: true,
  },
];