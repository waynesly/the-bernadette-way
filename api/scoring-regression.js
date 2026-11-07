import { runScoringRegressionSuite } from "lib/scoring-tests.js";
export const access = "admin";
export const methods = ["GET"];
export default async function(req,res) {
  try {
    res.setHeader("Cache-Control","no-store");
    res.json(runScoringRegressionSuite());
  } catch (error) {
    res.status(500).json({passed:false,error:error instanceof Error ? error.message : "Unknown scoring regression failure."});
  }
}