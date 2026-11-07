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
 const roster=await rosterForAccess(body.rosterId,code(body.accessCode));if(!roster)return res.status(403).json({error:"That Year 5 class access code is not recognised."});
 if(body.action==="get"){const {rows}=await db.query("SELECT s.display_name,s.completed_at FROM year5_roster_students s WHERE s.roster_id=$1 ORDER BY s.display_name",[roster.id]);return res.json({roster,students:rows})}
 return res.status(400).json({error:"Unknown Year 5 roster action."});
}