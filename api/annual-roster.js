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
 if(!Array.isArray(submitted)||!submitted.length||submitted.length>500)return res.status(400).json({error:"Provide 1–500 students."});
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
 let created=0,skipped=0,year5Created=0;
 const joinCards=[];
 for(const row of prepared){
  const classId=base.get(row.className);
  const existing=await db.query("SELECT id FROM classroom_baseline_students WHERE class_id=$1 AND school_student_id=$2",[classId,row.schoolId]);
  if(existing.rows.length)skipped++;
  else{
   const joinCode=makeCode();
   const inserted=await db.query("INSERT INTO classroom_baseline_students(class_id,display_name,join_code_hash,school_student_id) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING RETURNING id",[classId,row.displayName,await hash(joinCode),row.schoolId]);
   if(inserted.rows.length){created++;joinCards.push({pathway:"Years 3–6",studentId:row.schoolId,studentName:row.displayName,className:row.className,joinCode})}else skipped++;
  }
  if(row.className.startsWith("Year 5 ")){
   const rosterId=lead.get(row.className);
   const found=await db.query("SELECT id FROM year5_roster_students WHERE roster_id=$1 AND school_student_id=$2",[rosterId,row.schoolId]);
   if(!found.rows.length){
    const joinCode=makeCode();
    const inserted=await db.query("INSERT INTO year5_roster_students(roster_id,display_name,join_code_hash,school_student_id) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING RETURNING id",[rosterId,row.displayName,await hash(joinCode),row.schoolId]);
    if(inserted.rows.length){year5Created++;joinCards.push({pathway:"Year 5 leadership",studentId:row.schoolId,studentName:row.displayName,className:row.className,joinCode})}
   }
  }
 }
 return res.json({ok:true,year,created,skipped,year5Created,joinCards});
}