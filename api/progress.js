import { db } from "hatchable";
import { ASSESSMENT_VERSION } from "lib/scoring.js";
import { hash, validCode } from "lib/classroom-baseline.js";
function tokenFrom(req){const token=String(req.headers["x-strengths-resume"]||"");return /^[a-f0-9-]{72}$/.test(token)||/^y5_[A-HJ-NP-Z2-9]{8}$/.test(token)?token:null}
function text(value,limit){return String(value||"").trim().slice(0,limit)}
async function year5Student(token){if(!token?.startsWith("y5_"))return null;const code=token.slice(3);if(!validCode(code))return null;const {rows}=await db.query("SELECT s.id,s.display_name,r.class_name FROM year5_roster_students s JOIN year5_rosters r ON r.id=s.roster_id WHERE s.join_code_hash=$1 LIMIT 1",[await hash(code)]);return rows[0]||null}
export const access="public";
export const methods=["GET","POST","DELETE"];
export default async function(req,res){
 const rawToken=tokenFrom(req);if(!rawToken&&req.method!=="POST")return res.status(400).json({error:"A valid resume token is required."});
 const rosterStudent=await year5Student(rawToken);
 if(rawToken?.startsWith("y5_")&&!rosterStudent)return res.status(404).json({error:"We could not find this Year 5 student code."});
 const tokenHash=rawToken?await hash(rawToken):null;
 if(req.method==="POST"){
   const body=req.body||{},responses=body.responses,currentQuestion=Number(body.currentQuestion);
   const studentName=rosterStudent?.display_name||text(body.name,100),className=rosterStudent?.class_name||text(body.className,80);
   if(!studentName||!className||!Array.isArray(responses)||responses.length>96||!responses.every(value=>value===null||(Number.isInteger(value)&&value>=1&&value<=5))||!Number.isInteger(currentQuestion)||currentQuestion<0||currentQuestion>95)return res.status(400).json({error:"Invalid assessment progress."});
   const issuedToken=rawToken||crypto.randomUUID()+crypto.randomUUID(),issuedHash=rawToken?tokenHash:await hash(issuedToken);
   await db.query("INSERT INTO assessment_progress(resume_token_hash,student_name,class_name,responses,current_question,assessment_version,year5_roster_student_id) VALUES($1,$2,$3,$4::jsonb,$5,$6,$7) ON CONFLICT(resume_token_hash) DO UPDATE SET student_name=EXCLUDED.student_name,class_name=EXCLUDED.class_name,responses=EXCLUDED.responses,current_question=EXCLUDED.current_question,assessment_version=EXCLUDED.assessment_version,year5_roster_student_id=COALESCE(assessment_progress.year5_roster_student_id,EXCLUDED.year5_roster_student_id),updated_at=now()",[issuedHash,studentName,className,JSON.stringify(responses),currentQuestion,ASSESSMENT_VERSION,rosterStudent?.id||null]);
   return res.json({ok:true,resumeToken:issuedToken,assessmentVersion:ASSESSMENT_VERSION});
 }
 if(req.method==="DELETE"){await db.query("DELETE FROM assessment_progress WHERE resume_token_hash=$1",[tokenHash]);return res.json({ok:true})}
 const {rows}=await db.query("SELECT student_name,class_name,responses,current_question,assessment_version,completed_at,completed_scores,completed_submission_id,updated_at FROM assessment_progress WHERE resume_token_hash=$1 LIMIT 1",[tokenHash]);if(!rows.length)return res.status(404).json({error:"No saved assessment was found."});const progress=rows[0];if(!Array.isArray(progress.responses)||progress.responses.length>96||!progress.responses.every(value=>value===null||(Number.isInteger(value)&&value>=1&&value<=5)))return res.status(409).json({error:"Saved assessment data is invalid."});res.setHeader("Cache-Control","no-store");res.json({progress});
}