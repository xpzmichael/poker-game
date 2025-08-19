import { randomInt } from 'crypto';

/**
 * Creates a standard 52-card deck
 * @returns {Array} Array of card strings (e.g., ['2s', '3s', ...])
 */
function makeDeck() {
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
  const suits = ['s', 'h', 'd', 'c']; // spades, hearts, diamonds, clubs
  const deck = [];
  
  for (const rank of ranks) {
    for (const suit of suits) {
      deck.push(rank + suit);
    }
  }
  
  return deck;
}

/**
 * Shuffles an array in place using Fisher-Yates algorithm with crypto-secure randomness
 * @param {Array} deck - Array to shuffle
 * @returns {Array} The same array, shuffled
 */
function shuffleInPlace(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/**
 * Converts card string to human-readable format
 * @param {string} card - Card string (e.g., 'As', 'Kh')
 * @returns {string} Human-readable card (e.g., 'Ace of Spades')
 */
function cardToString(card) {
  if (!card || card.length !== 2) return 'Unknown Card';
  
  const rank = card[0];
  const suit = card[1];
  
  const rankNames = {
    '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five', '6': 'Six',
    '7': 'Seven', '8': 'Eight', '9': 'Nine', 'T': 'Ten',
    'J': 'Jack', 'Q': 'Queen', 'K': 'King', 'A': 'Ace'
  };
  
  const suitNames = {
    's': 'Spades', 'h': 'Hearts', 'd': 'Diamonds', 'c': 'Clubs'
  };
  
  const rankName = rankNames[rank] || rank;
  const suitName = suitNames[suit] || suit;
  
  return `${rankName} of ${suitName}`;
}

/**
 * Gets the Unicode symbol for a card
 * @param {string} card - Card string (e.g., 'As', 'Kh')  
 * @returns {string} Unicode card symbol
 */
function cardToUnicode(card) {
  if (!card || card.length !== 2) return '🂠';
  
  const rank = card[0];
  const suit = card[1];
  
  // Unicode playing card symbols
  const symbols = {
    's': { // Spades (black)
      'A': '🂡', '2': '🂢', '3': '🂣', '4': '🂤', '5': '🂥', '6': '🂦', '7': '🂧',
      '8': '🂨', '9': '🂩', 'T': '🂪', 'J': '🂫', 'Q': '🂭', 'K': '🂮'
    },
    'h': { // Hearts (red)  
      'A': '🂱', '2': '🂲', '3': '🂳', '4': '🂴', '5': '🂵', '6': '🂶', '7': '🂷',
      '8': '🂸', '9': '🂹', 'T': '🂺', 'J': '🂻', 'Q': '🂽', 'K': '🂾'
    },
    'd': { // Diamonds (red)
      'A': '🃁', '2': '🃂', '3': '🃃', '4': '🃄', '5': '🃅', '6': '🃆', '7': '🃇',
      '8': '🃈', '9': '🃉', 'T': '🃊', 'J': '🃋', 'Q': '🃍', 'K': '🃎'
    },
    'c': { // Clubs (black)
      'A': '🃑', '2': '🃒', '3': '🃓', '4': '🃔', '5': '🃕', '6': '🃖', '7': '🃗',
      '8': '🃘', '9': '🃙', 'T': '🃚', 'J': '🃛', 'Q': '🃝', 'K': '🃞'
    }
  };
  
  return symbols[suit]?.[rank] || '🂠';
}

/**
 * Validates if a card string is valid
 * @param {string} card - Card string to validate
 * @returns {boolean} True if valid card
 */
function isValidCard(card) {
  if (!card || typeof card !== 'string' || card.length !== 2) return false;
  
  const validRanks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
  const validSuits = ['s', 'h', 'd', 'c'];
  
  return validRanks.includes(card[0]) && validSuits.includes(card[1]);
}

export { 
  makeDeck, 
  shuffleInPlace, 
  cardToString, 
  cardToUnicode, 
  isValidCard 
};