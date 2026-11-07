import { db } from "hatchable";
import { QUESTIONS, hash, score, studentCode, validResponses } from "lib/classroom-baseline.js";
export const access="public";
export const methods=["POST"];
export default async function(req,res){
  res.setHeader("Cache-Control","no-store");
  const code=studentCode(req);if(!code)return res.status(400).json({error:"Your student session has expired. Enter your join code again."});
  const {rows}=await db.query("SELECT s.id,c.current_window FROM classroom_baseline_students s JOIN classroom_baseline_classes c ON c.id=s.class_id WHERE s.join_code_hash=$1 LIMIT 1",[await hash(code)]);
  if(!rows.length)return res.status(404).json({error:"We could not find your student profile."});
  const student=rows[0],body=req.body||{},responses=body.responses;
  if(!validResponses(responses))return res.status(400).json({error:"Please answer every check-in statement before saving."});
  const window=student.current_window;
  if(body.action==="save"){
    const saved=await db.query(`INSERT INTO classroom_baseline_attempts(student_id,assessment_window,responses)
      VALUES($1,$2,$3::jsonb) ON CONFLICT(student_id,assessment_window) DO UPDATE SET responses=EXCLUDED.responses,updated_at=now()
      WHERE classroom_baseline_attempts.status='draft' RETURNING id,status`,[student.id,window,JSON.stringify(responses)]);
    if(!saved.rows.length)return res.status(409).json({error:"This check-in has already been completed."});
    return res.json({ok:true,status:"draft"});
  }
  if(body.action==="complete"){
    const scores=score(responses);
    const completed=await db.query(`INSERT INTO classroom_baseline_attempts(student_id,assessment_window,status,responses,scores,completed_at)
      VALUES($1,$2,'completed',$3::jsonb,$4::jsonb,now())
      ON CONFLICT(student_id,assessment_window) DO UPDATE SET status='completed',responses=EXCLUDED.responses,scores=EXCLUDED.scores,completed_at=now(),updated_at=now()
      WHERE classroom_baseline_attempts.status='draft' RETURNING scores,assessment_window,completed_at`,[student.id,window,JSON.stringify(responses),JSON.stringify(scores)]);
    if(!completed.rows.length)return res.status(409).json({error:"This check-in has already been completed."});
    return res.json({ok:true,attempt:completed.rows[0],questionCount:QUESTIONS.length});
  }
  return res.status(400).json({error:"Unknown student action."});
}