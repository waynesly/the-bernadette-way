import { db } from "hatchable";
import {staff,assignments} from "lib/class-access.js";
import { scoreResponses, validResponses } from "lib/scoring.js";
export const access = "public";
export const methods = ["GET"];

export default async function(req,res) {
  const user=await staff(req);if(!user)return res.status(401).json({error:"Staff sign-in required."});
  const allowed=await assignments(user,"year5");
  const names=await db.query("SELECT class_name FROM year5_rosters WHERE id = ANY($1::uuid[])",[allowed||[]]);
  const permittedNames=names.rows.map(row=>row.class_name);
  res.setHeader("Cache-Control","no-store");
  const submissionsResult = await db.query("SELECT id,student_name,class_name,responses,scores,assessment_version,created_at FROM submissions ORDER BY created_at DESC LIMIT 2000");
  const reflectionsResult = await db.query("SELECT p.completed_submission_id AS submission_id,r.strength_id,r.how_used,r.what_happened,r.impact_on_others,r.learned,r.future_goal,r.selected_for_report FROM assessment_progress p JOIN student_reflections r ON r.resume_token_hash=p.resume_token_hash WHERE p.completed_submission_id IS NOT NULL ORDER BY r.created_at DESC");
  const reflectionsBySubmission = {};
  for (const reflection of reflectionsResult.rows) {
    const key = String(reflection.submission_id);
    (reflectionsBySubmission[key] ||= []).push(reflection);
  }
  const submissions = submissionsResult.rows.map(row => ({
    ...row,
    scores: validResponses(row.responses) ? scoreResponses(row.responses) : row.scores,
    selected_reflections: reflectionsBySubmission[String(row.id)] || []
  }));
  res.json({submissions});
}