import { db } from "hatchable";
import { hash, studentCode, validCode, questionsForWindow } from "lib/classroom-baseline.js";
export const access="public";
export const methods=["GET","POST"];
async function profile(code){
  const {rows}=await db.query(`SELECT s.id,s.display_name,c.class_name,c.current_window,a.assessment_window,a.status,a.responses,a.scores,a.completed_at
    FROM classroom_baseline_students s JOIN classroom_baseline_classes c ON c.id=s.class_id
    LEFT JOIN classroom_baseline_attempts a ON a.student_id=s.id WHERE s.join_code_hash=$1`,[await hash(code)]);
  if(!rows.length)return null;
  const first=rows[0],attempts={};
  for(const row of rows)if(row.assessment_window)attempts[row.assessment_window]={status:row.status,responses:row.responses,scores:row.scores,completed_at:row.completed_at};
  return {student:{id:first.id,display_name:first.display_name,class_name:first.class_name,current_window:first.current_window},attempts};
}
export default async function(req,res){
  res.setHeader("Cache-Control","no-store");
  const code=req.method==="POST"?String(req.body?.joinCode||"").trim().toUpperCase():studentCode(req);
  if(!validCode(code))return res.status(400).json({error:"Enter the eight-character join code from your teacher."});
  const data=await profile(code);
  if(!data)return res.status(404).json({error:"We could not find that student code. Check it with your teacher."});
  return res.json({...data,studentCode:code,questions:questionsForWindow(data.student.current_window)});
}