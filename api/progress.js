import { db } from "hatchable";
import { ASSESSMENT_VERSION, validResponses } from "lib/scoring.js";

const encoder = new TextEncoder();
async function digest(value) {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
  return [...bytes].map(byte => byte.toString(16).padStart(2, "0")).join("");
}
function tokenFrom(req) {
  const token = String(req.headers["x-strengths-resume"] || "");
  return /^[a-f0-9-]{72}$/.test(token) ? token : null;
}
function text(value, limit) {
  return String(value || "").trim().slice(0, limit);
}
function token() {
  return crypto.randomUUID() + crypto.randomUUID();
}
export const access = "public";
export const methods = ["GET","POST","DELETE"];

export default async function(req,res) {
  const rawToken = tokenFrom(req);
  if (req.method === "POST") {
    const body = req.body || {};
    const studentName = text(body.name, 100);
    const className = text(body.className, 80);
    const responses = body.responses;
    const currentQuestion = Number(body.currentQuestion);
    if (!studentName || !className || !Array.isArray(responses) || responses.length > 96 ||
        !responses.every(value => value === null || (Number.isInteger(value) && value >= 1 && value <= 5)) ||
        !Number.isInteger(currentQuestion) || currentQuestion < 0 || currentQuestion > 95) {
      return res.status(400).json({error:"Invalid assessment progress."});
    }
    const issuedToken = rawToken || token();
    const tokenHash = await digest(issuedToken);
    await db.query(
      "INSERT INTO assessment_progress (resume_token_hash,student_name,class_name,responses,current_question,assessment_version) VALUES ($1,$2,$3,$4::jsonb,$5,$6) ON CONFLICT (resume_token_hash) DO UPDATE SET student_name=EXCLUDED.student_name,class_name=EXCLUDED.class_name,responses=EXCLUDED.responses,current_question=EXCLUDED.current_question,assessment_version=EXCLUDED.assessment_version,updated_at=now()",
      [tokenHash,studentName,className,JSON.stringify(responses),currentQuestion,ASSESSMENT_VERSION]
    );
    return res.json({ok:true,resumeToken:issuedToken,assessmentVersion:ASSESSMENT_VERSION});
  }
  if (!rawToken) return res.status(400).json({error:"A valid resume token is required."});
  const tokenHash = await digest(rawToken);
  if (req.method === "DELETE") {
    await db.query("DELETE FROM assessment_progress WHERE resume_token_hash=$1",[tokenHash]);
    return res.json({ok:true});
  }
  const {rows} = await db.query("SELECT student_name,class_name,responses,current_question,assessment_version,updated_at FROM assessment_progress WHERE resume_token_hash=$1 LIMIT 1",[tokenHash]);
  if (!rows.length) return res.status(404).json({error:"No saved assessment was found."});
  const progress = rows[0];
  if (!Array.isArray(progress.responses) || progress.responses.length > 96 || !progress.responses.every(value => value === null || (Number.isInteger(value) && value >= 1 && value <= 5))) {
    return res.status(409).json({error:"Saved assessment data is invalid."});
  }
  res.setHeader("Cache-Control","no-store");
  res.json({progress});
}