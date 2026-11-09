import {db} from "hatchable";
import {staff} from "lib/class-access.js";
import {provision,classSummary,STANDARD_CLASSES,validYear} from "lib/annual-classes.js";
import {hash,makeCode} from "lib/classroom-baseline.js";
export const access="public";export const methods=["POST"];
const trim=(v,n)=>String(v??"").trim().slice(0,n);
export default async function(req,res){
 res.setHeader("Cache-Control","no-store");
 const user=await staff(req);
 if(!user||user.role!=="admin")return res.status(403).json({error:"Administrator Staff Account required."});
 const body=req.body||{},year=Number(body.year);
 if(!validYear(year))return res.status(400).json({error:"Select a school year from 2026 onwards."});
 if(body.action==="status")return res.json({year,classes:await classSummary(year)});
 if(body.action==="provision")return res.json({ok:true,...await provision(year),classes:await classSummary(year)});
 if(body.action!=="import")return res.status(400).json({error:"Unknown action."});
 const submitted=body.students;
 if(!Array.isArray(submitted)||!submitted.length||submitted.length>20)return res.status(400).json({error:"Import 1–20 students per batch."});
 const prepared=[],seen=new Set();
 for(let i=0;i<submitted.length;i++){
  const row=submitted[i],schoolId=trim(row.studentId,80),first=trim(row.firstName,80),surname=trim(row.surname,80),
   level=Number(row.year),className=trim(row.className,80).replace(/\s+/g," ").replace(/^year\s*/i,"Year ").replace(/\b(blue|red)\b/i,x=>x[0].toUpperCase()+x.slice(1).toLowerCase());
  if(!/^[A-Za-z0-9_-]{2,80}$/.test(schoolId)||!first||!surname||!STANDARD_CLASSES.includes(className)||level!==Number(className.match(/^Year (\d)/)?.[1])||seen.has(schoolId))
   return res.status(400).json({error:"Invalid student ID, year, class or duplicate ID on CSV row "+(i+2)+". No students were imported."});
  seen.add(schoolId);prepared.push({schoolId,displayName:first+" "+surname,className});
 }
 const classes=await classSummary(year);
 if(classes.baseline.length!==8||classes.leadership.length!==2)return res.status(409).json({error:"Provision this year's ten classes before importing."});
 const base=new Map(classes.baseline.map(c=>[c.class_name,c.id])),lead=new Map(classes.leadership.map(c=>[c.class_name,c.id]));
 // Two bulk inserts per batch replace up to 80 per-student DB calls.
 // Existing records are never updated, and codes are only returned for newly inserted records.
 const baseCodes=[],leadCodes=[];
 for(const row of prepared){
  const code=makeCode();
  baseCodes.push({...row,classId:base.get(row.className),joinCode:code,codeHash:await hash(code)});
  if(row.className.startsWith("Year 5 ")){
   const leadershipCode=makeCode();
   leadCodes.push({...row,classId:lead.get(row.className),joinCode:leadershipCode,codeHash:await hash(leadershipCode)});
  }
 }
 const basePayload=baseCodes.map(({schoolId,displayName,classId,codeHash})=>({schoolId,displayName,classId,codeHash}));
 const baseResult=await db.query(`INSERT INTO classroom_baseline_students(class_id,display_name,join_code_hash,school_student_id)
 SELECT p."classId"::uuid,p."displayName",p."codeHash",p."schoolId"
 FROM jsonb_to_recordset($1::jsonb) AS p("classId" text,"displayName" text,"codeHash" text,"schoolId" text)
 ON CONFLICT DO NOTHING RETURNING class_id,school_student_id`,[JSON.stringify(basePayload)]);
 let leadResult={rows:[]};
 if(leadCodes.length){
  const leadPayload=leadCodes.map(({schoolId,displayName,classId,codeHash})=>({schoolId,displayName,classId,codeHash}));
  leadResult=await db.query(`INSERT INTO year5_roster_students(roster_id,display_name,join_code_hash,school_student_id)
  SELECT p."classId"::uuid,p."displayName",p."codeHash",p."schoolId"
  FROM jsonb_to_recordset($1::jsonb) AS p("classId" text,"displayName" text,"codeHash" text,"schoolId" text)
  ON CONFLICT DO NOTHING RETURNING roster_id,school_student_id`,[JSON.stringify(leadPayload)]);
 }
 const madeBase=new Set(baseResult.rows.map(r=>String(r.class_id)+":"+r.school_student_id));
 const madeLead=new Set(leadResult.rows.map(r=>String(r.roster_id)+":"+r.school_student_id));
 const joinCards=[
  ...baseCodes.filter(r=>madeBase.has(r.classId+":"+r.schoolId)).map(r=>({pathway:"Years 3–6",studentId:r.schoolId,studentName:r.displayName,className:r.className,joinCode:r.joinCode})),
  ...leadCodes.filter(r=>madeLead.has(r.classId+":"+r.schoolId)).map(r=>({pathway:"Year 5 leadership",studentId:r.schoolId,studentName:r.displayName,className:r.className,joinCode:r.joinCode}))
 ];
 return res.json({ok:true,year,created:baseResult.rows.length,skipped:prepared.length-baseResult.rows.length,year5Created:leadResult.rows.length,joinCards});
}