import { db } from "hatchable";
import { verifyToken } from "lib/teacher-auth.js";
import { cleanText, hash, makeCode, WINDOWS } from "lib/classroom-baseline.js";
export const access="public";
export const methods=["GET","POST"];

async function requireTeacher(req,res){if(!await verifyToken(req)){res.status(401).json({error:"Teacher password required."});return false}return true}
function classId(value){return String(value||"").trim()}
async function getClass(id){const {rows}=await db.query("SELECT id,class_name,calendar_year,current_window FROM classroom_baseline_classes WHERE id=$1",[id]);return rows[0]||null}
async function listClasses(){const {rows}=await db.query(`SELECT c.id,c.class_name,c.calendar_year,c.current_window,COUNT(s.id)::int AS student_count
  FROM classroom_baseline_classes c LEFT JOIN classroom_baseline_students s ON s.class_id=c.id
  GROUP BY c.id ORDER BY c.calendar_year DESC,c.class_name ASC`);return rows}
async function classData(classroom){
  const {rows}=await db.query(`SELECT s.id,s.display_name,a.assessment_window,a.status,a.scores,a.completed_at,a.responses
    FROM classroom_baseline_students s LEFT JOIN classroom_baseline_attempts a ON a.student_id=s.id
    WHERE s.class_id=$1 ORDER BY s.display_name,a.assessment_window`,[classroom.id]);
  const observations=await db.query(`SELECT o.student_id,o.assessment_window,o.tags,o.note,o.updated_at
    FROM classroom_baseline_observations o JOIN classroom_baseline_students s ON s.id=o.student_id WHERE s.class_id=$1`,[classroom.id]);
  const students={};
  for(const row of rows){const student=students[row.id]||={id:row.id,display_name:row.display_name,attempts:{},observations:{}};if(row.assessment_window)student.attempts[row.assessment_window]={status:row.status,scores:row.scores,completed_at:row.completed_at,responses:row.responses};students[row.id]=student}
  for(const row of observations.rows){if(students[row.student_id])students[row.student_id].observations[row.assessment_window]={tags:row.tags||[],note:row.note||"",updated_at:row.updated_at}}
  return {classroom:{id:classroom.id,class_name:classroom.class_name,calendar_year:classroom.calendar_year,current_window:classroom.current_window},students:Object.values(students)};
}
export default async function(req,res){
 res.setHeader("Cache-Control","no-store");
  if(!await requireTeacher(req,res))return;
  res.setHeader("Cache-Control","no-store");
  const body=req.body||{};
  if(req.method==="GET")return res.json({classes:await listClasses()});
  if(body.action==="list_classes")return res.json({classes:await listClasses()});
  if(body.action==="create_class"){
    const className=cleanText(body.className,80);
    const calendarYear=Number(body.calendarYear);
    const names=[...new Set((Array.isArray(body.students)?body.students:[]).map(name=>cleanText(name,100)).filter(Boolean))];
    if(!className||names.length===0||names.length>40)return res.status(400).json({error:"Enter a class name and between 1 and 40 student names."});
    if(!Number.isInteger(calendarYear)||calendarYear<2020||calendarYear>2100)return res.status(400).json({error:"Enter a valid calendar year."});
    let accessCode=makeCode(),created;
    for(let attempt=0;attempt<4;attempt++){try{created=await db.query("INSERT INTO classroom_baseline_classes(class_name,calendar_year,access_code_hash) VALUES($1,$2,$3) RETURNING id,class_name,calendar_year,current_window",[className,calendarYear,await hash(accessCode)]);break}catch(error){accessCode=makeCode()}}
    if(!created?.rows?.[0])return res.status(500).json({error:"Unable to create this class. Please try again."});
    const classroom=created.rows[0],roster=[];
    for(const displayName of names){let joinCode=makeCode(),saved=false;for(let attempt=0;attempt<4&&!saved;attempt++){try{await db.query("INSERT INTO classroom_baseline_students(class_id,display_name,join_code_hash) VALUES($1,$2,$3)",[classroom.id,displayName,await hash(joinCode)]);saved=true}catch(error){joinCode=makeCode()}}if(!saved)return res.status(500).json({error:"Class created, but a student code could not be made. Start a fresh class instead."});roster.push({display_name:displayName,join_code:joinCode})}
    return res.status(201).json({classroom,roster});
  }
  const classroom=await getClass(classId(body.classId));
  if(!classroom)return res.status(404).json({error:"Class not found."});
  if(body.action==="get_class")return res.json(await classData(classroom));
  if(body.action==="reset_join_codes"){
    const all=body.scope==="class",studentId=String(body.studentId||"");
    if(!all&&!/^[a-f0-9-]{36}$/i.test(studentId))return res.status(400).json({error:"Choose a student."});
    const {rows}=await db.query("SELECT id,display_name FROM classroom_baseline_students WHERE class_id=$1 AND ($2::boolean OR id=$3::uuid) ORDER BY display_name",[classroom.id,all,all?null:studentId]);
    if(!rows.length)return res.status(404).json({error:"No matching students in this class."});
    if(body.confirm!==true)return res.status(400).json({error:"Confirm the code reset first."});
    const codes=[];
    for(const student of rows){let updated=false;
      for(let attempt=0;attempt<5&&!updated;attempt++){const join_code=makeCode();try{const result=await db.query("UPDATE classroom_baseline_students SET join_code_hash=$1 WHERE id=$2 AND class_id=$3 RETURNING id",[await hash(join_code),student.id,classroom.id]);if(result.rows.length){codes.push({id:student.id,display_name:student.display_name,join_code});updated=true}}catch(error){if(attempt===4)throw error}}
      if(!updated)return res.status(500).json({error:"A code could not be reset. Refresh and check before trying again."});
    }
    return res.json({ok:true,students:codes});
  }
  if(body.action==="set_window"){
    const window=body.assessmentWindow;
    if(!WINDOWS.includes(window))return res.status(400).json({error:"Choose a valid assessment window."});
    await db.query("UPDATE classroom_baseline_classes SET current_window=$1 WHERE id=$2",[window,classroom.id]);
    return res.json({ok:true,currentWindow:window});
  }
  if(body.action==="save_observation"){
    const studentId=String(body.studentId||"");const tags=[...new Set((Array.isArray(body.tags)?body.tags:[]).map(x=>cleanText(x,40)).filter(x=>["Joins in readily","Thoughtful observer","Needs predictable routines","Thrives with a partner","Ready to lead"].includes(x)))].slice(0,4);const note=cleanText(body.note,400);
    const belongs=await db.query("SELECT id FROM classroom_baseline_students WHERE id=$1 AND class_id=$2",[studentId,classroom.id]);
    if(!belongs.rows.length)return res.status(404).json({error:"Student not found in this class."});
    await db.query(`INSERT INTO classroom_baseline_observations(student_id,assessment_window,tags,note,updated_at) VALUES($1,$2,$3::jsonb,$4,now()) ON CONFLICT(student_id,assessment_window) DO UPDATE SET tags=EXCLUDED.tags,note=EXCLUDED.note,updated_at=now()`,[studentId,classroom.current_window,JSON.stringify(tags),note]);
    return res.json({ok:true});
  }
  if(body.action==="clear_student_data"){
    const scope=body.scope==="class"?"class":"student";const studentId=String(body.studentId||"");
    if(scope==="student"){const belongs=await db.query("SELECT id FROM classroom_baseline_students WHERE id=$1 AND class_id=$2",[studentId,classroom.id]);if(!belongs.rows.length)return res.status(404).json({error:"Student not found in this class."});await db.query("DELETE FROM classroom_baseline_observations WHERE student_id=$1",[studentId]);await db.query("DELETE FROM classroom_baseline_attempts WHERE student_id=$1",[studentId]);return res.json({ok:true,scope:"student"})}
    await db.query("DELETE FROM classroom_baseline_observations WHERE student_id IN (SELECT id FROM classroom_baseline_students WHERE class_id=$1)",[classroom.id]);await db.query("DELETE FROM classroom_baseline_attempts WHERE student_id IN (SELECT id FROM classroom_baseline_students WHERE class_id=$1)",[classroom.id]);return res.json({ok:true,scope:"class"});
  }
  if(body.action==="remove_student"){
    const studentId=String(body.studentId||"");
    const belongs=await db.query("SELECT id FROM classroom_baseline_students WHERE id=$1 AND class_id=$2",[studentId,classroom.id]);
    if(!belongs.rows.length)return res.status(404).json({error:"Student not found in this class."});
    await db.query("DELETE FROM classroom_baseline_observations WHERE student_id=$1",[studentId]);
    await db.query("DELETE FROM classroom_baseline_students WHERE id=$1",[studentId]);
    return res.json({ok:true});
  }
  if(body.action==="delete_class"){
    await db.query("DELETE FROM classroom_baseline_observations WHERE student_id IN (SELECT id FROM classroom_baseline_students WHERE class_id=$1)",[classroom.id]);
    await db.query("DELETE FROM classroom_baseline_classes WHERE id=$1",[classroom.id]);
    return res.json({ok:true});
  }
  return res.status(400).json({error:"Unknown teacher action."});
}