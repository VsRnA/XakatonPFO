// handlers/lottery/calculateVerification.js

import { generateWinningBarrels, generateRandomnessBitsFile } from '#services/lotteryCalculation.js';
import { calculateFinalSeed } from '#helpers/lotteryCalculation.js';
import { createSeedHash } from '#services/drandServices.js';
import { rLottery } from '#repos';
import { NotFoundError } from '#errors';
import storage from '#infrastructure/storage.js';

export default async (request) => {
  const {
    lotteryId,
    seed,
    drandRandomness,
    playerEntropies, 
    barrelLimit,
    barrelCount,
    generateBitsFile = true, // Опциональный параметр
  } = request.payload;

  const seedHash = createSeedHash(seed);
  const finalSeed = calculateFinalSeed(seed, drandRandomness, playerEntropies);
  const winningBarrels = generateWinningBarrels(
    finalSeed, 
    parseInt(barrelLimit),
    parseInt(barrelCount), 
  );

  // Генерация и загрузка файла в S3 (если запрошено)
  let bitsFileUrl = null;
  if (generateBitsFile) {
    const bitsContent = generateRandomnessBitsFile(
      lotteryId || 'verification',
      finalSeed,
      1000000
    );
    
    const filename = `verification/lottery_${lotteryId || Date.now()}_randomness_test.txt`;
    
    bitsFileUrl = await storage.upload(Buffer.from(bitsContent, 'utf-8'), 'testFiles', {
        contentType:  'text/plain',
        metadata: {
          originalName: filename,
          uploadedAt: new Date().toISOString()
        }
      });
    console.log('bitsFileUrl', bitsFileUrl);
  }

  let officialData = null;
  let anomalies = [];
  
  if (lotteryId) {
    try {
      const lottery = await rLottery.findById(lotteryId);
      
      if (!lottery) {
        throw new NotFoundError('Lottery not found');
      }
      
      if (lottery && lottery.status === 'Calculated') {
        officialData = {
          seedHash: lottery.seedHash,
          finalSeed: lottery.metadata.finalSeed,
          drandRandomness: lottery.metadata.drandRandomness,
          winningBarrels: lottery.metadata.winningBarrels,
          totalParticipants: lottery.metadata.totalParticipants,
        };

        if (seedHash !== officialData.seedHash) {
          anomalies.push({
            type: 'seed_hash_mismatch',
            severity: 'critical',
            description: 'SHA-256 хеш seed не совпадает с опубликованным commitment',
            expected: officialData.seedHash,
            actual: seedHash,
          });
        }

        if (drandRandomness !== officialData.drandRandomness) {
          anomalies.push({
            type: 'drand_mismatch',
            severity: 'critical',
            description: 'Drand randomness не совпадает с использованным в розыгрыше',
            expected: officialData.drandRandomness,
            actual: drandRandomness,
          });
        }

        if (finalSeed !== officialData.finalSeed) {
          anomalies.push({
            type: 'final_seed_mismatch',
            severity: 'critical',
            description: 'Final seed не совпадает с официальным (возможно отличаются энтропии игроков)',
            expected: officialData.finalSeed,
            actual: finalSeed,
          });
        }

        if (JSON.stringify(winningBarrels) !== JSON.stringify(officialData.winningBarrels)) {
          anomalies.push({
            type: 'winning_barrels_mismatch',
            severity: 'critical',
            description: 'Выигрышные бочки не совпадают с официальными',
            expected: officialData.winningBarrels,
            actual: winningBarrels,
          });
        }

        if (lottery.metadata.totalParticipants !== playerEntropies.length) {
          anomalies.push({
            type: 'participants_count_mismatch',
            severity: 'warning',
            description: 'Количество энтропий игроков не совпадает с официальным',
            expected: lottery.metadata.totalParticipants,
            actual: playerEntropies.length,
          });
        }
      }
    } catch (error) {
      // Не критично для калькулятора
    }
  }

  return {
    calculated: {
      seedHash,
      playerEntropies,
      finalSeed,
      winningBarrels,
    },
    official: officialData,
    verification: {
      isValid: anomalies.length === 0,
      anomaliesCount: anomalies.length,
      criticalAnomalies: anomalies.filter(a => a.severity === 'critical').length,
      warnings: anomalies.filter(a => a.severity === 'warning').length,
    },
    anomalies,
    randomnessTestFileUrl: bitsFileUrl, // ← Ссылка на файл в S3
    steps: [
      {
        step: 1,
        name: 'Вычисление seedHash',
        input: seed,
        output: seedHash,
        formula: 'SHA-256(seed)',
        valid: !officialData || seedHash === officialData.seedHash,
      },
      {
        step: 2,
        name: 'Обработка энтропий игроков',
        input: playerEntropies,
        output: playerEntropies,
        formula: 'Сортировка энтропий игроков',
        valid: !officialData || playerEntropies.length === officialData.totalParticipants,
      },
      {
        step: 3,
        name: 'Формирование finalSeed',
        input: {
          seed,
          drandRandomness,
          playerEntropies: playerEntropies,
        },
        output: finalSeed,
        formula: 'SHA-256(seed + "-" + drand_randomness + "-" + sorted(player_entropies).join("-"))',
        valid: !officialData || finalSeed === officialData.finalSeed,
      },
      {
        step: 4,
        name: 'Генерация выигрышных бочек',
        input: finalSeed,
        output: winningBarrels,
        formula: 'Fisher-Yates shuffle с final_seed как источником случайности',
        valid: !officialData || JSON.stringify(winningBarrels) === JSON.stringify(officialData.winningBarrels),
      },
    ],
  };
};