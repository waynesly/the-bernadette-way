import { REVERSE_SCORED_IDS, STRENGTH_QUESTION_IDS, scoreResponses, validResponses } from "lib/scoring.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}
function all(value) {
  return Array(96).fill(value);
}
function total(scores) {
  return Object.values(scores).reduce((sum, value) => sum + value, 0);
}

export function runScoringRegressionSuite() {
  const questionIds = Object.values(STRENGTH_QUESTION_IDS).flat();
  assert(Object.keys(STRENGTH_QUESTION_IDS).length === 24, "Expected 24 strengths.");
  assert(questionIds.length === 96, "Expected 96 mapped question references.");
  assert(new Set(questionIds).size === 96, "Question mappings must be unique.");
  assert(questionIds.every(id => Number.isInteger(id) && id >= 1 && id <= 96), "Question mappings must be within 1–96.");

  const minimum = scoreResponses(all(1));
  const maximum = scoreResponses(all(5));
  const neutral = scoreResponses(all(3));
  for (const [strength, value] of Object.entries(minimum)) {
    assert(strength === "Forgiveness" ? value === 20 : value === 4, "Minimum-response score failed for " + strength);
  }
  for (const [strength, value] of Object.entries(maximum)) {
    assert(strength === "Forgiveness" ? value === 4 : value === 20, "Maximum-response score failed for " + strength);
  }
  assert(Object.values(neutral).every(value => value === 12), "Neutral responses must create a 24-way tie at 12.");
  assert(total(neutral) === 288, "Neutral-score total must be 288.");

  const reverseCase = all(3);
  reverseCase[11] = 1;
  reverseCase[18] = 2;
  reverseCase[27] = 4;
  reverseCase[49] = 5;
  const reverseScores = scoreResponses(reverseCase);
  assert(reverseScores.Forgiveness === 12, "Reverse-scored Forgiveness items did not total 12.");
  assert(REVERSE_SCORED_IDS.size === 4 && [12,19,28,50].every(id => REVERSE_SCORED_IDS.has(id)), "Reverse-score map differs from workbook.");

  const mixed = Array.from({length:96}, (_, index) => index % 5 + 1);
  const mixedOnce = scoreResponses(mixed);
  const mixedTwice = scoreResponses(mixed);
  assert(same(mixedOnce, mixedTwice), "Repeated calculations must be deterministic.");
  assert(Object.values(mixedOnce).every(value => Number.isInteger(value) && value >= 4 && value <= 20), "Mixed scores must stay in range.");

  assert(!validResponses([]), "Missing responses must be rejected.");
  assert(!validResponses(Array(96).fill(0)), "Out-of-range responses must be rejected.");
  assert(!validResponses(Array(95).fill(3)), "Incomplete responses must be rejected.");

  return {passed:true,cases:9,reverseScoredQuestions:[12,19,28,50],strengths:24,questions:96};
}