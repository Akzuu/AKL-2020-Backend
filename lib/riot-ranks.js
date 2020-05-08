const tierMap = new Map([
  ['UNRANKED', 0],
  ['IRON', 1],
  ['BRONZE', 2],
  ['SILVER', 3],
  ['GOLD', 4],
  ['PLATINUM', 5],
  ['DIAMOND', 6],
  ['MASTER', 7],
  ['GRANDMASTER', 8],
  ['CHALLENGER', 9],
]);

const rankMap = new Map([
  ['UNRANKED', 0],
  ['IV', 1],
  ['III', 2],
  ['II', 3],
  ['I', 4],
]);

module.exports = {
  tierMap,
  rankMap,
};
