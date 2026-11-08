import {db} from "hatchable";
const enc=new TextEncoder();
async function hash(s){return [...new Uint8Array(await crypto.subtle.digest("SHA-256",enc.encode(s)))].map(x=>x.toString(16).padStart(2,"0")).join("")}
export async function staff(req){
 const fromHeader=String(req.headers["x-staff-session"]||"");
 const fromBearer=String(req.headers.authorization||"").match(/^Bearer ([a-f0-9]{64})$/i)?.[1]||"";
 const fromCookie=String(req.headers.cookie||"").split(";").map(x=>x.trim()).find(x=>x.startsWith("staff_journal="))?.slice(14)||"";
 const token=[fromHeader,fromBearer,fromCookie].find(x=>/^[a-f0-9]{64}$/i.test(x));
 if(!token)return null;
 const {rows}=await db.query("SELECT a.id,a.role,a.username FROM staff_journal_sessions s JOIN staff_journal_accounts a ON a.id=s.account_id WHERE s.token_hash=$1 AND s.expires_at>now() AND a.disabled=false AND a.must_change_password=false LIMIT 1",[await hash(token.toLowerCase())]);
 return rows[0]||null;
}
export async function permitted(user,kind,id){
 if(!user)return false;
 if(user.role==="admin")return true;
 if(!/^[a-f0-9-]{36}$/i.test(String(id||"")))return false;
 const {rows}=await db.query("SELECT 1 FROM staff_class_assignments WHERE account_id=$1 AND class_kind=$2 AND class_id=$3::uuid LIMIT 1",[user.id,kind,id]);
 return rows.length>0;
}
export async function assignments(user,kind){
 if(user.role==="admin")return null;
 const {rows}=await db.query("SELECT class_id FROM staff_class_assignments WHERE account_id=$1 AND class_kind=$2",[user.id,kind]);
 return rows.map(r=>r.class_id);
}