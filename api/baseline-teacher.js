import { db } from "hatchable";
import { verifyToken } from "lib/teacher-auth.js";
import { cleanText, classForAccess, hash, makeCode } from "lib/classroom-baseline.js";
export const access="public";
export const methods=["GET","POST"];

async function requireTeacher(req,res){if(!await verifyToken(req)){res.status(401).json({error:"Teacher password required."});return false}return true}
function code(value){return String(value||"").trim().toUpperCase()}
export default async function(req,res){
  if(!await requireTeacher(req,res))return;
  res.setHeader("Cache-Control","no-store");
  if(req.method==="POST"){
    const body=req.body||{};
    if(body.action==="create_class"){
      const className=cleanText(body.className,80);
      const names=[...new Set((Array.isArray(body.students)?body.students:[]).map(name=>cleanText(name,100)).filter(Boolean))];
      if(!className||names.length===0||names.length>40)return res.status(400).json({error:"Enter a class name and between 1 and 40 student names."});
      let accessCode=makeCode();
      let created;
      for(let attempt=0;attempt<4;attempt++){
        try{created=await db.query("INSERT INTO classroom_baseline_classes(class_name,access_code_hash) VALUES($1,$2) RETURNING id,class_name,current_window",[className,await hash(accessCode)]);break}catch(error){accessCode=makeCode()}
      }
      if(!created?.rows?.[0])return res.status(500).json({error:"Unable to create this class. Please try again."});
      const classroom=created.rows[0], roster=[];
      for(const displayName of names){
        let joinCode=makeCode(), saved=false;
        for(let attempt=0;attempt<4&&!saved;attempt++){
          try{await db.query("INSERT INTO classroom_baseline_students(class_id,display_name,join_code_hash) VALUES($1,$2,$3)",[classroom.id,displayName,await hash(joinCode)]);saved=true}catch(error){joinCode=makeCode()}
        }
        if(!saved)return res.status(500).json({error:"Class created, but a student code could not be made. Start a fresh class instead."});
        roster.push({display_name:displayName,join_code:joinCode});
      }
      return res.status(201).json({classroom,accessCode,roster});
    }
    const classroom=await classForAccess(body.classId,code(body.accessCode));
    if(!classroom)return res.status(403).json({error:"That class access code is not recognised."});
    if(body.action==="get_class"){
      const {rows}=await db.query(`SELECT s.id,s.display_name,a.assessment_window,a.status,a.scores,a.completed_at,a.responses
        FROM classroom_baseline_students s LEFT JOIN classroom_baseline_attempts a ON a.student_id=s.id
        WHERE s.class_id=$1 ORDER BY s.display_name,a.assessment_window`,[classroom.id]);
      const students={};
      for(const row of rows){const student=students[row.id]||={id:row.id,display_name:row.display_name,attempts:{}};if(row.assessment_window)student.attempts[row.assessment_window]={status:row.status,scores:row.scores,completed_at:row.completed_at,responses:row.responses};students[row.id]=student}
      return res.json({classroom:{id:classroom.id,class_name:classroom.class_name,current_window:classroom.current_window},students:Object.values(students)});
    }
    if(body.action==="set_window"){
      const window=body.assessmentWindow;
      if(window!=="start_of_year"&&window!=="end_of_year")return res.status(400).json({error:"Choose a valid assessment window."});
      await db.query("UPDATE classroom_baseline_classes SET current_window=$1 WHERE id=$2",[window,classroom.id]);
      return res.json({ok:true,currentWindow:window});
    }
    return res.status(400).json({error:"Unknown teacher action."});
  }
  const classroom=await classForAccess(req.query.classId,code(req.query.accessCode));
  if(!classroom)return res.status(403).json({error:"That class access code is not recognised."});
  const {rows}=await db.query(`SELECT s.id,s.display_name,a.assessment_window,a.status,a.scores,a.completed_at,a.responses
    FROM classroom_baseline_students s LEFT JOIN classroom_baseline_attempts a ON a.student_id=s.id
    WHERE s.class_id=$1 ORDER BY s.display_name,a.assessment_window`,[classroom.id]);
  const students={};
  for(const row of rows){const student=students[row.id]||={id:row.id,display_name:row.display_name,attempts:{}};if(row.assessment_window)student.attempts[row.assessment_window]={status:row.status,scores:row.scores,completed_at:row.completed_at,responses:row.responses};students[row.id]=student}
  return res.json({classroom:{id:classroom.id,class_name:classroom.class_name,current_window:classroom.current_window},students:Object.values(students)});
}