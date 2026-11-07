export const ASSESSMENT_VERSION = "year5-leadership-day-2026-11";
export const STRENGTH_QUESTION_IDS = {
  "Social Intelligence":[1,48,5,3],"Love":[11,21,41,46],"Kindness":[51,15,92,38],"Fairness":[45,89,55,91],
  "Teamwork":[72,60,4,79],"Perspective":[17,93,58,13],"Leadership":[88,31,77,36],"Bravery":[43,52,22,62],
  "Love of Learning":[87,83,74,70],"Curiosity":[90,84,34,78],"Appreciation of Beauty":[96,63,42,82],
  "Creativity":[16,10,8,9],"Prudence":[29,73,6,53],"Self-regulation":[47,68,59,56],"Forgiveness":[12,19,50,28],
  "Open-mindedness":[26,40,66,23],"Humility":[75,25,30,65],"Perseverance":[81,71,67,85],"Zest":[76,35,39,33],
  "Gratitude":[20,86,2,49],"Spirituality":[95,24,7,64],"Hope":[44,27,57,18],"Humour":[54,37,14,80],"Honesty":[94,32,61,69]
};
export const REVERSE_SCORED_IDS = new Set([12,19,28,50]);
export function validResponses(responses) {
  return Array.isArray(responses) && responses.length === 96 && responses.every(value => Number.isInteger(value) && value >= 1 && value <= 5);
}
export function scoreResponses(responses) {
  if (!validResponses(responses)) throw new Error("Exactly 96 whole-number responses from 1 to 5 are required.");
  return Object.fromEntries(Object.entries(STRENGTH_QUESTION_IDS).map(([strength, questionIds]) => [strength, questionIds.reduce((total, questionId) => {
    const response = responses[questionId - 1];
    return total + (REVERSE_SCORED_IDS.has(questionId) ? 6 - response : response);
  }, 0)]));
}