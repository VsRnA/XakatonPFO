// #helpers/lotteryCalculation.js
import crypto from 'crypto';
import { ValidationError } from '#errors';

/**
 * Проверяет целостность seed
 */
export function verifySeedHash(seed, seedHash) {
  const calculatedHash = crypto.createHash('sha256').update(seed).digest('hex');
  
  if (calculatedHash !== seedHash) {
    throw new ValidationError('Нарушена целостность данных лотереи', {
      code: 'SEED_HASH_MISMATCH',
      data: { expectedHash: seedHash, calculatedHash },
    });
  }
}

/**
 * Вычисляет финальный seed для определения победителей
 */
export function calculateFinalSeed(secretSeed, drandRandomness, entropies) {
  const sortedEntropies = [...entropies].sort();
  
  const components = [
    secretSeed,
    drandRandomness,
    ...sortedEntropies,
  ].join('-');

  return crypto.createHash('sha256').update(components).digest('hex');
}

/**
 * Обрабатывает результаты участников
 */
export function processParticipantResults(participants, winningBarrels) {
  const results = participants.map(participant => {
    const playerBarrels = JSON.parse(participant.metadata?.barrelsNumber || '[]');
    const matchCount = calculateMatches(playerBarrels, winningBarrels);

    return {
      userId: participant.userId,
      entropy: participant.entropy,
      playerBarrels,
      matchCount,
    };
  });

  // Сортируем по количеству совпадений (от большего к меньшему)
  results.sort((a, b) => b.matchCount - a.matchCount);

  return results;
}

/**
 * Определяет победителей
 */
export function determineWinners(results) {
  if (results.length === 0) {
    return [];
  }

  const maxMatches = results[0].matchCount;
  
  if (maxMatches === 0) {
    return [];
  }

  return results.filter(r => r.matchCount === maxMatches);
}

/**
 * Вычисляет совпадения между бочонками игрока и выигрышными
 */
function calculateMatches(playerBarrels, winningBarrels) {
  return playerBarrels.filter(barrel => winningBarrels.includes(barrel)).length;
}