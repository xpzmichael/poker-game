/**
 * Validates if a player action is legal
 * @param {Game} game - Game instance
 * @param {Object} player - Player object
 * @param {string} action - Action type ('fold', 'check', 'call', 'raise', 'bet')
 * @param {number} amount - Amount for raise/bet actions
 * @returns {Object} { valid: boolean, error?: string }
 */
function validateAction(game, player, action, amount = 0) {
  // Basic validations
  if (game.phase === 'waiting' || game.phase === 'showdown') {
    return { valid: false, error: 'No hand in progress' };
  }

  if (player.folded) {
    return { valid: false, error: 'Player already folded' };
  }
  
  if (player.allIn) {
    return { valid: false, error: 'Player is all-in' };
  }

  if (player.chips === 0) {
    return { valid: false, error: 'Player has no chips' };
  }

  const toCall = Math.max(0, game.currentBet - (player.betThisRound || 0));
  const canCall = player.chips >= toCall;
  
  switch (action) {
    case 'fold':
      return { valid: true };
      
    case 'check':
      if (toCall > 0) {
        return { valid: false, error: 'Cannot check when facing a bet' };
      }
      return { valid: true };
      
    case 'call':
      if (toCall === 0) {
        return { valid: false, error: 'Nothing to call' };
      }
      if (!canCall) {
        return { valid: false, error: 'Not enough chips to call' };
      }
      return { valid: true };
      
    case 'bet':
      if (game.currentBet > 0) {
        return { valid: false, error: 'Cannot bet when someone has already bet (use raise)' };
      }
      if (amount <= 0) {
        return { valid: false, error: 'Bet amount must be positive' };
      }
      if (amount > player.chips) {
        return { valid: false, error: 'Not enough chips to bet that amount' };
      }
      if (amount < game.bigBlind && amount < player.chips) {
        return { valid: false, error: `Minimum bet is ${game.bigBlind}` };
      }
      return { valid: true };
      
    case 'raise':
      if (toCall === 0) {
        return { valid: false, error: 'Cannot raise when no one has bet (use bet)' };
      }
      if (amount <= 0) {
        return { valid: false, error: 'Raise amount must be positive' };
      }
      
      const totalNeeded = toCall + amount;
      if (totalNeeded > player.chips) {
        return { valid: false, error: 'Not enough chips for that raise' };
      }
      
      // Check minimum raise
      if (amount < game.minRaise && totalNeeded < player.chips) {
        return { valid: false, error: `Minimum raise is ${game.minRaise}` };
      }
      
      return { valid: true };
      
    default:
      return { valid: false, error: 'Unknown action' };
  }
}

/**
 * Gets valid actions for a player in current game state
 * @param {Game} game - Game instance  
 * @param {Object} player - Player object
 * @returns {Array} Array of valid action objects { action: string, minAmount?: number, maxAmount?: number }
 */
function getValidActions(game, player) {
  if (player.folded || player.allIn || game.phase === 'waiting' || game.phase === 'showdown') {
    return [];
  }

  const actions = [];
  const toCall = Math.max(0, game.currentBet - (player.betThisRound || 0));
  
  // Fold is always available
  actions.push({ action: 'fold' });
  
  // Check if no bet to call
  if (toCall === 0) {
    actions.push({ action: 'check' });
    
    // Bet option
    if (player.chips > 0) {
      actions.push({
        action: 'bet',
        minAmount: Math.min(game.bigBlind, player.chips),
        maxAmount: player.chips
      });
    }
  } else {
    // Call option
    if (player.chips >= toCall) {
      actions.push({
        action: 'call',
        amount: toCall
      });
    }
    
    // Raise option
    const minRaiseTotal = toCall + game.minRaise;
    if (player.chips > toCall && (player.chips >= minRaiseTotal || player.chips === player.chips)) {
      actions.push({
        action: 'raise',
        minAmount: Math.min(game.minRaise, player.chips - toCall),
        maxAmount: player.chips - toCall,
        callAmount: toCall
      });
    }
  }

  // All-in option (if player has chips and there's betting action possible)
  if (player.chips > 0 && actions.length > 1) {
    const allInAction = toCall === 0 ? 'bet' : 'raise';
    if (!actions.some(a => a.action === allInAction && a.maxAmount === player.chips)) {
      actions.push({
        action: allInAction,
        amount: player.chips - (toCall === 0 ? 0 : toCall),
        allIn: true
      });
    }
  }

  return actions;
}

/**
 * Formats betting amounts for display
 * @param {number} amount - Amount in chips
 * @returns {string} Formatted amount
 */
function formatChips(amount) {
  return amount.toLocaleString();
}

/**
 * Gets pot odds for a call decision
 * @param {number} callAmount - Amount needed to call
 * @param {number} potSize - Current pot size
 * @returns {Object} { ratio: string, percentage: number }
 */
function getPotOdds(callAmount, potSize) {
  if (callAmount === 0) return { ratio: 'N/A', percentage: 0 };
  
  const ratio = Math.round((potSize + callAmount) / callAmount * 10) / 10;
  const percentage = Math.round(callAmount / (potSize + callAmount) * 100);
  
  return {
    ratio: `${ratio}:1`,
    percentage: percentage
  };
}

export { 
  validateAction, 
  getValidActions, 
  formatChips, 
  getPotOdds 
};