import { makeDeck, shuffleInPlace } from './deck.js';
import { createSidePots, distributePots } from './pot-manager.js';
import { validateAction, getValidActions } from './action-validator.js';
import { bestFive } from './poker-helper.js';

class Game {
  
  constructor() {
    this.players = []; // { id, name, chips, seat, hole:[], folded, connected, betThisRound, totalBet, allIn }
    this.deck = [];
    this.community = [];
    this.pot = 0;
    this.sidePots = []; // for all-in scenarios

    this.dealerIndex = 0;
    this.currentPlayerIndex = 0;
    this.currentBet = 0;
    this.minRaise = 0; // minimum raise amount
    this.phase = 'waiting'; // waiting | preflop | flop | turn | river | showdown

    // Blind structure
    this.smallBlind = 10;
    this.bigBlind = 20;

    // Track betting progress in a round
    this.playersActedInRound = new Set();
    this.lastRaiserIndex = -1; // index of last player who raised

    // last showdown summary (used for server -> clients)
    this.lastShowdown = null;

    // Track if blinds have been posted this hand
    this.blindsPosted = false;
  }

  addPlayer(id, name) {
    const existing = this.players.find(p => p.id === id);
    if (existing) {
      existing.connected = true;
      existing.name = name || existing.name;
      return existing;
    }
    const player = {
      // socket ID
      id,
      name: name || `Player${this.players.length + 1}`,
      chips: 1000,
      seat: this.players.length,
      hole: [],
      folded: false,
      connected: true,
      betThisRound: 0,
      totalBet: 0,
      allIn: false,
      ready: false
    };
    this.players.push(player);
    return player;
  }

  removePlayer(id) {
    const idx = this.players.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.players.splice(idx, 1);
      // reassign seats
      this.players.forEach((p, i) => p.seat = i);
      // Adjust dealer index if needed
      if (this.dealerIndex >= this.players.length) this.dealerIndex = 0;
      // Adjust current player index if needed
      if (this.currentPlayerIndex >= this.players.length) this.currentPlayerIndex = 0;
    }
  }

  removeUnreadyPlayers() {
    const unreadyPlayersIds = this.players.filter(p => !p.ready).map(p => p.id);
    unreadyPlayersIds.forEach(id => this.removePlayer(id));
  }

  getPublicState() {
    return {
      players: this.players.map(p => ({
        name: p.name,
        chips: p.chips,
        folded: !!p.folded,
        seat: p.seat,
        connected: !!p.connected,
        betThisRound: p.betThisRound || 0,
        allIn: !!p.allIn,
        ready: p.ready || false
      })),
      community: [...this.community],
      pot: this.pot,
      sidePots: this.sidePots,
      phase: this.phase,
      dealerSeat: this.players[this.dealerIndex] ? this.players[this.dealerIndex].seat : null,
      currentPlayerSeat: this.players[this.currentPlayerIndex] ? this.players[this.currentPlayerIndex].seat : null,
      currentBet: this.currentBet,
      minRaise: this.minRaise,
      smallBlind: this.smallBlind,
      bigBlind: this.bigBlind,
      blindsPosted: this.blindsPosted
    };
  }

  getPlayerState(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return null;
    
    return {
      ...this.getPublicState(),
      holeCards: player.hole,
      validActions: getValidActions(this, player)
    };
  }

  // PRIVATE: helper - count active (not folded, connected)
  _activePlayers() {
    return this.players.filter(p => !p.folded && p.connected);
  }

  // PRIVATE: helper - count players who can still act (not folded, connected, not all-in)
  _playersWhoCanAct() {
    return this.players.filter(p => !p.folded && p.connected && !p.allIn);
  }

  // PRIVATE: return next index (circular) of a player who is not folded and connected
  _nextActiveIndex(fromIndex) {
    if (this.players.length === 0) return -1;
    let i = (fromIndex + 1) % this.players.length;
    const start = i;
    while (true) {
      const p = this.players[i];
      if (p && !p.folded && p.connected) return i;
      i = (i + 1) % this.players.length;
      if (i === start) break;
    }
    return -1;
  }

  // PRIVATE: return next index of a player who can act (not folded, connected, not all-in)
  _nextPlayerWhoCanAct(fromIndex) {
    if (this.players.length === 0) return -1;
    let i = (fromIndex + 1) % this.players.length;
    const start = i;
    while (true) {
      const p = this.players[i];
      if (p && !p.folded && p.connected && !p.allIn) return i;
      i = (i + 1) % this.players.length;
      if (i === start) break;
    }
    return -1;
  }

  startHand() {
    if (this.players.length < 2) throw new Error('Need at least 2 players to start');
    if (this.phase !== 'waiting') throw new Error('Game already in progress');

    // Ensure all connected players are ready
    const unready = this.players.filter(p => p.connected && !p.ready);
    if (unready.length > 0) {
      throw new Error('Not all players are ready');
    }

    
    // Reset hand state
    this.deck = makeDeck();
    shuffleInPlace(this.deck);
    this.community = [];
    this.pot = 0;
    this.sidePots = [];
    this.currentBet = 0;
    this.minRaise = this.bigBlind;
    this.phase = 'preflop';
    this.blindsPosted = false;
    this.playersActedInRound = new Set();
    this.lastRaiserIndex = -1;
    
    this.players.forEach(p => {
      p.folded = false;
      p.hole = [];
      p.betThisRound = 0;
      p.totalBet = 0;
      p.allIn = false;
    });

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < this.players.length; j++) {
        const card = this.deck.pop();
        this.players[j].hole.push(card);
      }
    }

    this._postBlinds();

    this.lastShowdown = null;
    this.players.forEach(p => p.ready = false);
  }

  _postBlinds() {
    if (this.players.length < 2) return;

    const sbIndex = (this.dealerIndex + 1) % this.players.length;
    const bbIndex = (this.dealerIndex + 2) % this.players.length;

    const sbPlayer = this.players[sbIndex];
    const bbPlayer = this.players[bbIndex];

    const sbAmount = Math.min(sbPlayer.chips, this.smallBlind);
    sbPlayer.chips -= sbAmount;
    sbPlayer.betThisRound = sbAmount;
    sbPlayer.totalBet = (sbPlayer.totalBet || 0) + sbAmount;
    this.pot += sbAmount;
    if (sbPlayer.chips === 0) sbPlayer.allIn = true;

    const bbAmount = Math.min(bbPlayer.chips, this.bigBlind);
    bbPlayer.chips -= bbAmount;
    bbPlayer.betThisRound = bbAmount;
    bbPlayer.totalBet = (bbPlayer.totalBet || 0) + bbAmount;
    this.pot += bbAmount;
    this.currentBet = bbAmount;
    if (bbPlayer.chips === 0) bbPlayer.allIn = true;

    this.blindsPosted = true;

    this.currentPlayerIndex = (bbIndex + 1) % this.players.length;

    const nextCanAct = this._nextPlayerWhoCanAct(this.currentPlayerIndex - 1);
    if (nextCanAct !== -1) {
      this.currentPlayerIndex = nextCanAct;
    }

    this.lastRaiserIndex = bbIndex;
  }

  toggleReady(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      player.ready = !player.ready;
    }
  }

  playerAction(playerId, action, amount = 0) {
    const idx = this.players.findIndex(p => p.id === playerId);
    if (idx === -1) throw new Error('Player not found');
    const player = this.players[idx];

    if (this.phase === 'waiting') {
      if (action === 'ready') {
        this.toggleReady(playerId);
        return;
      }
      throw new Error('Game has not started yet');
    }
    if (idx !== this.currentPlayerIndex) throw new Error('Not your turn');
    if (player.folded) throw new Error('Player already folded');
    if (player.allIn) throw new Error('Player is all-in');

    
    const validation = validateAction(this, player, action, amount);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    
    if (action === 'fold') {
      player.folded = true;
    } else if (action === 'check') {
      // Nothing to change
    } else if (action === 'call') {
      const toCall = Math.max(0, this.currentBet - player.betThisRound);
      const actualAmount = Math.min(player.chips, toCall);
      player.chips -= actualAmount;
      player.betThisRound += actualAmount;
      player.totalBet = (player.totalBet || 0) + actualAmount;
      this.pot += actualAmount;
      if (player.chips === 0) player.allIn = true;
    } else if (action === 'raise' || action === 'bet') {
      const toCall = Math.max(0, this.currentBet - player.betThisRound);
      const totalNeeded = toCall + amount;
      const actualAmount = Math.min(player.chips, totalNeeded);
      
      player.chips -= actualAmount;
      player.betThisRound += actualAmount;
      player.totalBet = (player.totalBet || 0) + actualAmount;
      this.pot += actualAmount;
      
      if (actualAmount >= totalNeeded) {
        this.currentBet = player.betThisRound;
        this.minRaise = amount;
      } else {
        player.allIn = true;
      }
      
      if (player.chips === 0) player.allIn = true;
      
      if (actualAmount >= totalNeeded) {
        this.playersActedInRound = new Set([player.id]);
        this.lastRaiserIndex = idx;
      }
    }

    if (action !== 'raise' && action !== 'bet') {
      this.playersActedInRound.add(player.id);
    } else if (player.allIn && player.totalBet < this.currentBet) {
      this.playersActedInRound.add(player.id);
    }

    this._advanceToNextPlayer();

    const stillActive = this._activePlayers();
    if (stillActive.length <= 1) {
      this._finishHandDueToFold();
      return;
    }

    if (this._isBettingRoundComplete()) {
      this._advancePhase();
    }
  }

  _advanceToNextPlayer() {
    const nextCanAct = this._nextPlayerWhoCanAct(this.currentPlayerIndex);
    if (nextCanAct !== -1) {
      this.currentPlayerIndex = nextCanAct;
    }
  }

  _isBettingRoundComplete() {
    const playersWhoCanAct = this._playersWhoCanAct();

    // If no players can act, round is complete
    if (playersWhoCanAct.length === 0) return true;

    // All players who can act must have acted
    const allActed = playersWhoCanAct.every(p => this.playersActedInRound.has(p.id));
    if (!allActed) return false;

    // Now ensure all bets are matched (or all-in)
    const activePlayers = this._activePlayers();
    const allMatched = activePlayers.every(p => {
      // either they’ve matched the current bet,
      // OR they’re all-in and can’t act further
      return p.betThisRound === this.currentBet || p.allIn;
    });

    return allMatched;
  }


  _finishHandDueToFold() {
    const stillActive = this._activePlayers();
    if (stillActive.length === 1) {
      const winner = stillActive[0];
      winner.chips += this.pot;
      this.lastShowdown = {
        winners: [{ name: winner.name, handName: 'Won by fold' }],
        ranks: []
      };
      this.pot = 0;
      this.sidePots = [];
      this.players.forEach(p => {
        p.betThisRound = 0;
        p.totalBet = 0;
      });
      this.phase = 'waiting';
      this._rotateDealerButton();
    }
  }

  _advancePhase() {
    if (this.phase === 'preflop') {
      this.community.push(this.deck.pop(), this.deck.pop(), this.deck.pop());
      this.phase = 'flop';
    } else if (this.phase === 'flop') {
      this.community.push(this.deck.pop());
      this.phase = 'turn';
    } else if (this.phase === 'turn') {
      this.community.push(this.deck.pop());
      this.phase = 'river';
    } else if (this.phase === 'river') {
      this.phase = 'showdown';
      this._evaluateShowdown();
      return;
    }

    this._startNewBettingRound();
  }

  _startNewBettingRound() {
    this.players.forEach(p => p.betThisRound = 0);
    this.currentBet = 0;
    this.minRaise = this.bigBlind;
    this.playersActedInRound = new Set();
    this.lastRaiserIndex = -1;

    let firstToAct = this._nextActiveIndex(this.dealerIndex);
    // Find first player who can actually act
    firstToAct = this._nextPlayerWhoCanAct(firstToAct - 1);
    if (firstToAct !== -1) {
      this.currentPlayerIndex = firstToAct;
    } else {
      this._advancePhase();
    }

  }

  _evaluateShowdown() {
    const totalPot = this.pot;

    this.sidePots = createSidePots(this.players, totalPot);
    
    console.log(`Total pot to distribute: ${totalPot}, Side pots:`, this.sidePots);

    const active = this.players.filter(p => !p.folded);
    const ranks = active.map(p => {
      const all = [...p.hole, ...this.community];
      const res = bestFive(all);
      return { 
        player: p, 
        value: res.value, 
        handName: res.handName,
        hand: res.hand || p.hole // if bestFive does not return a hand, fallback to player's hole cards
      };
    });

    const results = distributePots(this.sidePots, ranks);

    this.lastShowdown = {
      winners: results.winners,
      ranks: ranks.map(r => ({ 
        name: r.player.name, 
        handName: r.handName, 
        value: r.value,
        cards: r.hand 
      })),
      totalPot: totalPot
    };

    this.pot = 0;
    this.sidePots = [];
    this.players.forEach(p => {
      p.betThisRound = 0;
      p.totalBet = 0;
    });
    this.phase = 'waiting';
    this._rotateDealerButton();
  }

  _rotateDealerButton() {
    this.dealerIndex = (this.dealerIndex + 1) % this.players.length;
  }

  getMinBetAmount(player) {
    if (this.currentBet === 0) {
      return Math.min(this.bigBlind, player.chips);
    } else {
      const toCall = this.currentBet - (player.betThisRound || 0);
      const minRaiseTotal = toCall + this.minRaise;
      return Math.min(minRaiseTotal, player.chips);
    }
  }

  getCallAmount(player) {
    return Math.max(0, Math.min(player.chips, this.currentBet - (player.betThisRound || 0)));
  }
}

export default Game;
