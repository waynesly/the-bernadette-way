import { db } from "hatchable";
import { verifyToken } from "lib/teacher-auth.js";
import { cleanText, hash, makeCode, validCode } from "lib/classroom-baseline.js";
export const access="public";
export const methods=["POST"];
function code(value){return String(value||"").trim().toUpperCase()}
async function authorised(req,res){if(!await verifyToken(req)){res.status(401).json({error:"Teacher password required."});return false}return true}
async function rosterForAccess(id,accessCode){if(!/^[a-f0-9-]{36}$/i.test(String(id||""))||!validCode(accessCode))return null;const {rows}=await db.query("SELECT id,class_name FROM year5_rosters WHERE id=$1 AND access_code_hash=$2 LIMIT 1",[id,await hash(accessCode)]);return rows[0]||null}
export default async function(req,res){
 if(!await authorised(req,res))return;res.setHeader("Cache-Control","no-store");const body=req.body||{};
 if(body.action==="create"){
   const className=cleanText(body.className,80),names=[...new Set((Array.isArray(body.students)?body.students:[]).map(name=>cleanText(name,100)).filter(Boolean))];
   if(!className||names.length<1||names.length>40)return res.status(400).json({error:"Enter a class name and between 1 and 40 student names."});
   let accessCode=makeCode(),created;
   for(let i=0;i<4&&!created;i++){try{created=await db.query("INSERT INTO year5_rosters(class_name,access_code_hash) VALUES($1,$2) RETURNING id,class_name",[className,await hash(accessCode)])}catch(error){accessCode=makeCode()}}
   if(!created?.rows?.[0])return res.status(500).json({error:"We could not create the class. Please try again."});
   const roster=[],classroom=created.rows[0];
   for(const displayName of names){let joinCode=makeCode(),saved=false;for(let i=0;i<4&&!saved;i++){try{await db.query("INSERT INTO year5_roster_students(roster_id,display_name,join_code_hash) VALUES($1,$2,$3)",[classroom.id,displayName,await hash(joinCode)]);saved=true}catch(error){joinCode=makeCode()}}if(!saved)return res.status(500).json({error:"The class was created, but a student code could not be made. Please begin again."});roster.push({display_name:displayName,join_code:joinCode})}
   return res.status(201).json({roster:classroom,accessCode,students:roster});
 }
 if(body.action==="add"){
   const rosterId=String(body.rosterId||""),inputStudents=Array.isArray(body.students)?body.students:[],names=[];
   for(let index=0;index<inputStudents.length;index++){const name=cleanText(inputStudents[index],100);if(name&&names.indexOf(name)===-1)names.push(name)}
   if(!/^[a-f0-9-]{36}$/i.test(rosterId)||names.length<1||names.length>40)return res.status(400).json({error:"Enter between 1 and 40 student names."});
   const rosterQuery=await db.query("SELECT id,class_name FROM year5_rosters WHERE id=$1 LIMIT 1",[rosterId]),roster=rosterQuery.rows[0];
   if(!roster)return res.status(404).json({error:"That class could not be found."});
   const existingQuery=await db.query("SELECT LOWER(display_name) AS name FROM year5_roster_students WHERE roster_id=$1",[rosterId]),existing=existingQuery.rows;
   for(let index=0;index<names.length;index++){for(let existingIndex=0;existingIndex<existing.length;existingIndex++){if(names[index].toLowerCase()===existing[existingIndex].name)return res.status(400).json({error:"Already in this class: "+names[index]+". Remove duplicate names and try again."})}}
   const students=[];
   for(let index=0;index<names.length;index++){const displayName=names[index];let joinCode=makeCode(),saved=false;for(let attempt=0;attempt<4&&!saved;attempt++){try{await db.query("INSERT INTO year5_roster_students(roster_id,display_name,join_code_hash) VALUES($1,$2,$3)",[rosterId,displayName,await hash(joinCode)]);saved=true}catch(error){joinCode=makeCode()}}if(!saved)return res.status(500).json({error:"A student code could not be made. Please try again."});students.push({display_name:displayName,join_code:joinCode})}
   return res.status(201).json({roster:roster,students:students});
 }
 if(body.action==="list"){const {rows}=await db.query("SELECT r.id,r.class_name,COUNT(s.*)::int AS student_count,COUNT(s.completed_at)::int AS completed_count FROM year5_rosters r LEFT JOIN year5_roster_students s ON s.roster_id=r.id GROUP BY r.id,r.class_name ORDER BY r.class_name");return res.json({rosters:rows})}
 if(body.action==="getTeacher"){const ids=[...new Set((Array.isArray(body.rosterIds)?body.rosterIds:[body.rosterId]).map(String).filter(id=>/^[a-f0-9-]{36}$/i.test(id)))];if(!ids.length||ids.length>30)return res.status(400).json({error:"Choose one or more valid Year 5 classes."});const {rows:rosters}=await db.query("SELECT id,class_name FROM year5_rosters WHERE id = ANY($1::uuid[]) ORDER BY class_name",[ids]);if(!rosters.length)return res.status(404).json({error:"The selected Year 5 classes could not be found."});const {rows}=await db.query("SELECT s.roster_id,s.display_name,s.completed_at,r.class_name FROM year5_roster_students s JOIN year5_rosters r ON r.id=s.roster_id WHERE s.roster_id = ANY($1::uuid[]) ORDER BY r.class_name,s.display_name",[rosters.map(r=>r.id)]);return res.json({rosters,students:rows})}
 const roster=await rosterForAccess(body.rosterId,code(body.accessCode));if(!roster)return res.status(403).json({error:"That Year 5 class access code is not recognised."});
 if(body.action==="get"){const {rows}=await db.query("SELECT s.display_name,s.completed_at FROM year5_roster_students s WHERE s.roster_id=$1 ORDER BY s.display_name",[roster.id]);return res.json({roster,students:rows})}
 return res.status(400).json({error:"Unknown Year 5 roster action."});
}