/**
 * Creates side pots for all-in scenarios
 * @param {Array} players - Array of player objects (each should have .totalBet and .folded)
 * @param {number} totalPot - Current total pot amount (sum of all contributions)
 * @returns {Array} Array of pot objects { amount, eligiblePlayers }
 */
function createSidePots(players, totalPot) {
  // Contributors are those who contributed > 0 during the hand (including folded players)
  const contributors = players.filter(p => (p.totalBet || 0) > 0);

  if (contributors.length === 0) {
    return totalPot > 0 ? [{ amount: totalPot, eligiblePlayers: [] }] : [];
  }

  // Get unique contribution levels (sorted ascending)
  const betLevels = [...new Set(contributors.map(p => p.totalBet || 0))].sort((a, b) => a - b);

  const pots = [];
  let previousLevel = 0;

  for (let i = 0; i < betLevels.length; i++) {
    const currentLevel = betLevels[i];
    const contribution = currentLevel - previousLevel;
    if (contribution <= 0) {
      previousLevel = currentLevel;
      continue;
    }

    // Number of contributors who contributed at least currentLevel (this determines how much is placed into this level)
    const contributorsAtLevel = contributors.filter(p => (p.totalBet || 0) >= currentLevel);

    if (contributorsAtLevel.length > 0) {
      // Pot amount from this level = contribution * number of contributors at this level
      const potAmount = contribution * contributorsAtLevel.length;

      // Eligible players to win this pot are those who:
      // - are NOT folded
      // - contributed at least currentLevel
      const eligiblePlayers = players
        .filter(p => !p.folded && (p.totalBet || 0) >= currentLevel)
        .map(p => p.id);

      pots.push({
        amount: potAmount,
        eligiblePlayers
      });
    }

    previousLevel = currentLevel;
  }

  // Sum of pots produced
  const sumPots = pots.reduce((s, x) => s + x.amount, 0);

  // If there's any discrepancy between computed pots and provided totalPot, adjust last pot
  const diff = totalPot - sumPots;
  if (diff !== 0) {
    if (pots.length > 0) {
      pots[pots.length - 1].amount += diff;
    } else {
      // no pots built for some reason, make a single pot with all contributors eligible (non-folded)
      pots.push({
        amount: totalPot,
        eligiblePlayers: players.filter(p => !p.folded).map(p => p.id)
      });
    }
  }

  // Remove pots that have zero amount or no eligible players (but keep pots with amount and empty eligiblePlayers if needed)
  // (We keep pots with zero eligiblePlayers if necessary because folded contributions should still be part of pot sums,
  // but in normal operation eligiblePlayers should not be empty.)
  return pots.filter(p => p.amount > 0);
}

/**
 * Distributes pots to winners based on hand rankings
 * @param {Array} sidePots - Array of pot objects
 * @param {Array} ranks - Array of player rank objects { player, value, handName }
 * @returns {Object} Results object with winners array
 */
function distributePots(sidePots, ranks) {
  const results = { winners: [] };

  for (const pot of sidePots) {
    // Find eligible players for this pot based on pot.eligiblePlayers
    const eligibleRanks = ranks.filter(r => pot.eligiblePlayers.includes(r.player.id));

    if (eligibleRanks.length === 0) {
      // No eligible active players for this pot (rare corner case), skip
      continue;
    }

    // Best hand value among eligible players
    let bestValue = Math.max(...eligibleRanks.map(r => r.value));
    const potWinners = eligibleRanks.filter(r => r.value === bestValue);

    // Split pot among winners
    const share = Math.floor(pot.amount / potWinners.length);
    const remainder = pot.amount - (share * potWinners.length);

    potWinners.forEach((winner, index) => {
      const winAmount = share + (index === 0 ? remainder : 0);
      winner.player.chips += winAmount;
      
      // Add to results
      const existingWinner = results.winners.find(w => w.name === winner.player.name);
      if (existingWinner) {
        existingWinner.amount += winAmount;
      } else {
        results.winners.push({
          name: winner.player.name,
          handName: winner.handName,
          amount: winAmount
        });
      }
    });
  }

  return results;
}

export { createSidePots, distributePots };
