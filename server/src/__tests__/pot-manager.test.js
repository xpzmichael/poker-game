// __tests__/pot-manager.test.js
import { createSidePots, distributePots } from '../pot-manager.js';

test('single all-in creates main and side pot correctly', () => {
  const players = [
    { id: 'A', name: 'Alice', totalBet: 50, folded: false, chips: 0 },
    { id: 'B', name: 'Bob', totalBet: 100, folded: false, chips: 900 },
    { id: 'C', name: 'Carol', totalBet: 100, folded: false, chips: 900 }
  ];
  const totalPot = 250;

  const sidePots = createSidePots(players, totalPot);
  expect(sidePots).toEqual([
    { amount: 150, eligiblePlayers: ['A', 'B', 'C'] },  // main pot
    { amount: 100, eligiblePlayers: ['B', 'C'] }        // side pot
  ]);

  const ranks = [
    { player: players[0], value: 1, handName: 'Pair of twos' },
    { player: players[1], value: 2, handName: 'Pair of threes' },
    { player: players[2], value: 3, handName: 'Pair of fours' }
  ];

  const results = distributePots(sidePots, ranks);

  // Carol should win both pots
  expect(results.winners).toEqual([
    { name: 'Carol', handName: 'Pair of fours', amount: 250 }
  ]);
});
