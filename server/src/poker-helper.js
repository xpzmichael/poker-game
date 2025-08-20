import { evalHand } from 'poker-evaluator';


function bestFive(allCards) {
  // generate all 5-card combinations
  const combos = getCombinations(allCards, 5);

  let best = null;
  for (const combo of combos) {
    const res = evalHand(combo);
    if (!best || res.value > best.value) {
      best = { ...res, hand: combo };
    }
  }
  return best;
}

// utility to generate n-combinations
function getCombinations(arr, k) {
  const results = [];
  function helper(start, combo) {
    if (combo.length === k) {
      results.push([...combo]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      helper(i + 1, combo);
      combo.pop();
    }
  }
  helper(0, []);
  return results;
}


export {
    bestFive
}