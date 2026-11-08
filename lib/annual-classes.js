import {db} from "hatchable";
import {hash,makeCode} from "lib/classroom-baseline.js";
export const STANDARD_CLASSES=Array.from({length:4},(_,i)=>i+3).flatMap(year=>["Blue","Red"].map(colour=>`Year ${year} ${colour}`));
export function validYear(year){return Number.isInteger(year)&&year>=2026&&year<=2100}
export async function provision(year){
 if(!validYear(year))throw Error("Choose a valid school year.");
 const created=[];
 for(const name of STANDARD_CLASSES){
  let row=(await db.query("SELECT id FROM classroom_baseline_classes WHERE calendar_year=$1 AND class_name=$2 LIMIT 1",[year,name])).rows[0];
  if(!row){const result=await db.query("INSERT INTO classroom_baseline_classes(calendar_year,class_name,access_code_hash) VALUES($1,$2,$3) ON CONFLICT DO NOTHING RETURNING id",[year,name,await hash(makeCode())]);if(result.rows.length)created.push({pathway:"baseline",name});}
 }
 for(const name of ["Year 5 Blue","Year 5 Red"]){
  let row=(await db.query("SELECT id FROM year5_rosters WHERE calendar_year=$1 AND class_name=$2 LIMIT 1",[year,name])).rows[0];
  if(!row){const result=await db.query("INSERT INTO year5_rosters(calendar_year,class_name,access_code_hash) VALUES($1,$2,$3) ON CONFLICT DO NOTHING RETURNING id",[year,name,await hash(makeCode())]);if(result.rows.length)created.push({pathway:"year5",name});}
 }
 return {year,created,created_count:created.length};
}
export async function classSummary(year){
 const a=await db.query("SELECT c.id,c.class_name,COUNT(s.id)::int AS count FROM classroom_baseline_classes c LEFT JOIN classroom_baseline_students s ON s.class_id=c.id WHERE c.calendar_year=$1 AND c.class_name=ANY($2::text[]) GROUP BY c.id,c.class_name ORDER BY c.class_name",[year,STANDARD_CLASSES]);
 const b=await db.query("SELECT r.id,r.class_name,COUNT(s.id)::int AS count FROM year5_rosters r LEFT JOIN year5_roster_students s ON s.roster_id=r.id WHERE r.calendar_year=$1 AND r.class_name IN ('Year 5 Blue','Year 5 Red') GROUP BY r.id,r.class_name ORDER BY r.class_name",[year]);
 return {baseline:a.rows,leadership:b.rows};
}