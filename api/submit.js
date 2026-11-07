import { db } from "hatchable";
import { ASSESSMENT_VERSION, scoreResponses, validResponses } from "lib/scoring.js";
const encoder = new TextEncoder();
async function digest(value) {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
  return [...bytes].map(byte => byte.toString(16).padStart(2, "0")).join("");
}
function resumeToken(req) {
  const token = String(req.headers["x-strengths-resume"] || "");
  return /^[a-f0-9-]{72}$/.test(token) ? token : null;
}
export const access = "public";
export const methods = ["POST"];
export default async function(req,res) {
  const body = req.body || {};
  const name = String(body.name || "").trim().slice(0,100);
  const className = String(body.className || "").trim().slice(0,80);
  const responses = body.responses;
  if (!name || !className || !validResponses(responses)) return res.status(400).json({error:"Enter your name, class and all 96 ratings."});
  const scores = scoreResponses(responses);
  const {rows} = await db.query("INSERT INTO submissions (student_name,class_name,responses,scores,assessment_version) VALUES ($1,$2,$3::jsonb,$4::jsonb,$5) RETURNING id,created_at",[name,className,JSON.stringify(responses),JSON.stringify(scores),ASSESSMENT_VERSION]);
  const token = resumeToken(req);
  if (token) await db.query("UPDATE assessment_progress SET completed_at=now(),completed_scores=$2::jsonb,completed_submission_id=$3 WHERE resume_token_hash=$1",[await digest(token),JSON.stringify(scores),rows[0].id]);
  res.json({id:rows[0].id,createdAt:rows[0].created_at,scores,assessmentVersion:ASSESSMENT_VERSION});
}