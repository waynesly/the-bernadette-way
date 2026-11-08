import { db } from "hatchable";

const encoder = new TextEncoder();
async function digest(value) {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
  return [...bytes].map(byte => byte.toString(16).padStart(2, "0")).join("");
}
function tokenFrom(req) {
  const token = String(req.headers["x-strengths-resume"] || "");
  return /^[a-f0-9-]{72}$/.test(token) || /^y5_[A-HJ-NP-Z2-9]{8}$/.test(token) ? token : null;
}
function text(value, limit) {
  return String(value || "").trim().slice(0, limit);
}
export const access = "public";
export const methods = ["GET","POST","DELETE"];

export default async function(req,res) {
  const token = tokenFrom(req);
  if (!token) return res.status(400).json({error:"A valid resume token is required."});
  const tokenHash = await digest(token);
  const exists = await db.query("SELECT 1 FROM assessment_progress WHERE resume_token_hash=$1 LIMIT 1",[tokenHash]);
  if (!exists.rows.length) return res.status(404).json({error:"No saved assessment was found."});
  if (req.method === "GET") {
    const {rows} = await db.query("SELECT id,strength_id,how_used,what_happened,impact_on_others,learned,future_goal,selected_for_report,created_at,updated_at FROM student_reflections WHERE resume_token_hash=$1 ORDER BY created_at DESC",[tokenHash]);
    res.setHeader("Cache-Control","no-store");
    return res.json({reflections:rows});
  }
  if (req.method === "DELETE") {
    const id = Number(req.body?.id);
    if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({error:"A reflection ID is required."});
    await db.query("DELETE FROM student_reflections WHERE id=$1 AND resume_token_hash=$2",[id,tokenHash]);
    return res.json({ok:true});
  }
  const body = req.body || {};
  const strengthId = text(body.strengthId,80);
  const howUsed = text(body.howUsed,1500);
  const whatHappened = text(body.whatHappened,1500);
  const impact = text(body.impactOnOthers,1500);
  const learned = text(body.learned,1500);
  const futureGoal = text(body.futureGoal,1500);
  if (!strengthId || !howUsed || !whatHappened || !impact || !learned || !futureGoal) return res.status(400).json({error:"Complete every reflection prompt before saving."});
  const {rows} = await db.query("INSERT INTO student_reflections (resume_token_hash,strength_id,how_used,what_happened,impact_on_others,learned,future_goal,selected_for_report) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id,created_at",[tokenHash,strengthId,howUsed,whatHappened,impact,learned,futureGoal,true]);
  res.json({ok:true,reflection:rows[0]});
}