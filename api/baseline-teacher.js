import { db } from "hatchable";
import { verifyToken } from "lib/teacher-auth.js";
import { cleanText, classForAccess, hash, makeCode, WINDOWS } from "lib/classroom-baseline.js";
export const access="public";
export const methods=["GET","POST"];

async function requireTeacher(req,res){if(!await verifyToken(req)){res.status(401).json({error:"Teacher password required."});return false}return true}
function code(value){return String(value||"").trim().toUpperCase()}
async function classData(classroom){
  const {rows}=await db.query(`SELECT s.id,s.display_name,a.assessment_window,a.status,a.scores,a.completed_at,a.responses
    FROM classroom_baseline_students s LEFT JOIN classroom_baseline_attempts a ON a.student_id=s.id
    WHERE s.class_id=$1 ORDER BY s.display_name,a.assessment_window`,[classroom.id]);
  const observations=await db.query(`SELECT o.student_id,o.assessment_window,o.tags,o.note,o.updated_at
    FROM classroom_baseline_observations o JOIN classroom_baseline_students s ON s.id=o.student_id WHERE s.class_id=$1`,[classroom.id]);
  const students={};
  for(const row of rows){const student=students[row.id]||={id:row.id,display_name:row.display_name,attempts:{},observations:{}};if(row.assessment_window)student.attempts[row.assessment_window]={status:row.status,scores:row.scores,completed_at:row.completed_at,responses:row.responses};students[row.id]=student}
  for(const row of observations.rows){if(students[row.student_id])students[row.student_id].observations[row.assessment_window]={tags:row.tags||[],note:row.note||"",updated_at:row.updated_at}}
  return {classroom:{id:classroom.id,class_name:classroom.class_name,current_window:classroom.current_window},students:Object.values(students)};
}
export default async function(req,res){
  if(!await requireTeacher(req,res))return;
  res.setHeader("Cache-Control","no-store");
  if(req.method==="POST"){
    const body=req.body||{};
    if(body.action==="create_class"){
      const className=cleanText(body.className,80);
      const names=[...new Set((Array.isArray(body.students)?body.students:[]).map(name=>cleanText(name,100)).filter(Boolean))];
      if(!className||names.length===0||names.length>40)return res.status(400).json({error:"Enter a class name and between 1 and 40 student names."});
      let accessCode=makeCode(),created;
      for(let attempt=0;attempt<4;attempt++){try{created=await db.query("INSERT INTO classroom_baseline_classes(class_name,access_code_hash) VALUES($1,$2) RETURNING id,class_name,current_window",[className,await hash(accessCode)]);break}catch(error){accessCode=makeCode()}}
      if(!created?.rows?.[0])return res.status(500).json({error:"Unable to create this class. Please try again."});
      const classroom=created.rows[0],roster=[];
      for(const displayName of names){let joinCode=makeCode(),saved=false;for(let attempt=0;attempt<4&&!saved;attempt++){try{await db.query("INSERT INTO classroom_baseline_students(class_id,display_name,join_code_hash) VALUES($1,$2,$3)",[classroom.id,displayName,await hash(joinCode)]);saved=true}catch(error){joinCode=makeCode()}}if(!saved)return res.status(500).json({error:"Class created, but a student code could not be made. Start a fresh class instead."});roster.push({display_name:displayName,join_code:joinCode})}
      return res.status(201).json({classroom,accessCode,roster});
    }
    const classroom=await classForAccess(body.classId,code(body.accessCode));
    if(!classroom)return res.status(403).json({error:"That class access code is not recognised."});
    if(body.action==="get_class")return res.json(await classData(classroom));
    if(body.action==="set_window"){
      const window=body.assessmentWindow;
      if(!WINDOWS.includes(window))return res.status(400).json({error:"Choose a valid assessment window."});
      await db.query("UPDATE classroom_baseline_classes SET current_window=$1 WHERE id=$2",[window,classroom.id]);
      return res.json({ok:true,currentWindow:window});
    }
    if(body.action==="save_observation"){
      const studentId=String(body.studentId||"");const tags=[...new Set((Array.isArray(body.tags)?body.tags:[]).map(x=>cleanText(x,40)).filter(x=>["Joins in readily","Thoughtful observer","Needs predictable routines","Thrives with a partner","Ready to lead"].includes(x)))].slice(0,4);
      const note=cleanText(body.note,400);
      const belongs=await db.query("SELECT id FROM classroom_baseline_students WHERE id=$1 AND class_id=$2",[studentId,classroom.id]);
      if(!belongs.rows.length)return res.status(404).json({error:"Student not found in this class."});
      await db.query(`INSERT INTO classroom_baseline_observations(student_id,assessment_window,tags,note,updated_at) VALUES($1,$2,$3::jsonb,$4,now())
        ON CONFLICT(student_id,assessment_window) DO UPDATE SET tags=EXCLUDED.tags,note=EXCLUDED.note,updated_at=now()`,[studentId,classroom.current_window,JSON.stringify(tags),note]);
      return res.json({ok:true});
    }
    return res.status(400).json({error:"Unknown teacher action."});
  }
  const classroom=await classForAccess(req.query.classId,code(req.query.accessCode));
  if(!classroom)return res.status(403).json({error:"That class access code is not recognised."});
  return res.json(await classData(classroom));
}