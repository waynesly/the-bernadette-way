import {db} from "hatchable";
import {verifyToken} from "lib/teacher-auth.js";
export const access="public";export const methods=["GET","POST"];
const enc=new TextEncoder();
async function hash(s){return [...new Uint8Array(await crypto.subtle.digest("SHA-256",enc.encode(s)))].map(b=>b.toString(16).padStart(2,"0")).join("")}
function cookie(req){return String(req.headers.cookie||"").split(";").map(x=>x.trim()).find(x=>x.startsWith("staff_journal="))?.slice(14)||""}
function clean(s,max=150){return String(s||"").trim().slice(0,max)}
async function account(req){const token=cookie(req);if(!/^[a-f0-9]{64}$/.test(token))return null;const {rows}=await db.query("SELECT a.id,a.username,a.display_name FROM staff_journal_sessions s JOIN staff_journal_accounts a ON a.id=s.account_id WHERE s.token_hash=$1 AND s.expires_at>now()",[await hash(token)]);return rows[0]||null}
async function passwordHash(password,salt){return hash("staff-journal-v1:"+salt+":"+password)}
function setCookie(res,value,age){res.cookie("staff_journal",value,{httpOnly:true,secure:true,sameSite:"strict",path:"/",maxAge:age})}
export default async function(req,res){res.setHeader("Cache-Control","no-store");const b=req.body||{};const action=req.method==="GET"?"list":clean(b.action,40);
if(action==="register"){
 if(!await verifyToken(req))return res.status(401).json({error:"Sign in through the existing teacher dashboard first to create an individual account."});
 const username=clean(b.username,60).toLowerCase(),name=clean(b.displayName,100),password=String(b.password||"");
 if(!/^[a-z0-9._-]{3,60}$/.test(username)||name.length<2||password.length<14||password.length>200)return res.status(400).json({error:"Enter a username (3–60 characters), display name and unique password of at least 14 characters."});
 const salt=crypto.randomUUID()+crypto.randomUUID();try{await db.query("INSERT INTO staff_journal_accounts(username,display_name,salt,password_hash) VALUES($1,$2,$3,$4)",[username,name,salt,await passwordHash(password,salt)])}catch{return res.status(409).json({error:"Username unavailable."})}return res.status(201).json({ok:true});
}
if(action==="login"){
 const ip=String(req.headers["cf-connecting-ip"]||req.headers["x-forwarded-for"]||"unknown").split(",")[0].trim().slice(0,100);const attempts=await db.query("SELECT COUNT(*)::int AS n FROM staff_journal_login_attempts WHERE client_ip=$1 AND created_at>now()-interval '15 minutes'",[ip]);if(attempts.rows[0].n>=10)return res.status(429).json({error:"Too many sign-in attempts. Try again later."});
 const username=clean(b.username,60).toLowerCase(),password=String(b.password||"");const {rows}=await db.query("SELECT id,username,display_name,salt,password_hash FROM staff_journal_accounts WHERE username=$1",[username]);const user=rows[0];if(!user||password.length>200||await passwordHash(password,user.salt)!==user.password_hash){await db.query("INSERT INTO staff_journal_login_attempts(client_ip) VALUES($1)",[ip]);return res.status(401).json({error:"Invalid staff journal credentials."})}await db.query("DELETE FROM staff_journal_login_attempts WHERE client_ip=$1",[ip]);
 const token=crypto.randomUUID().replaceAll("-","")+crypto.randomUUID().replaceAll("-");await db.query("INSERT INTO staff_journal_sessions(token_hash,account_id,expires_at) VALUES($1,$2,now()+interval '4 hours')",[await hash(token),user.id]);setCookie(res,token,14400000);return res.json({ok:true,user:{username:user.username,display_name:user.display_name}});
}
if(action==="logout"){const token=cookie(req);if(/^[a-f0-9]{64}$/.test(token))await db.query("DELETE FROM staff_journal_sessions WHERE token_hash=$1",[await hash(token)]);setCookie(res,"",0);return res.json({ok:true})}
const user=await account(req);if(!user)return res.status(401).json({error:"Individual staff journal sign-in required."});
if(action==="list"){const {rows}=await db.query("SELECT id,title,status,fields,created_at,updated_at FROM staff_journal_entries WHERE owner_id=$1 ORDER BY updated_at DESC LIMIT 200",[user.id]);return res.json({user,entries:rows})}
if(action==="save"){
 const fields=b.fields;if(!fields||typeof fields!=="object"||Array.isArray(fields))return res.status(400).json({error:"Invalid reflection."});
 const permitted=["date","yearLevel","pathway","window","intention","discover","grow","shine","catholic","inclusion","success","barriers","evidence","next","review","indicator"];const safe={};for(const k of permitted)safe[k]=clean(fields[k],3000);if(JSON.stringify(safe).length>30000)return res.status(413).json({error:"Reflection too long."});
 const status=b.status==="complete"?"complete":"draft",title=clean(b.title,120)||"Staff reflection";
 if(b.id){const {rows}=await db.query("UPDATE staff_journal_entries SET title=$1,status=$2,fields=$3::jsonb,updated_at=now() WHERE id=$4 AND owner_id=$5 RETURNING id,updated_at",[title,status,JSON.stringify(safe),b.id,user.id]);if(!rows.length)return res.status(404).json({error:"Reflection not found."});return res.json({ok:true,entry:rows[0]})}
 const {rows}=await db.query("INSERT INTO staff_journal_entries(owner_id,title,status,fields) VALUES($1,$2,$3,$4::jsonb) RETURNING id,updated_at",[user.id,title,status,JSON.stringify(safe)]);return res.status(201).json({ok:true,entry:rows[0]});
}
return res.status(400).json({error:"Unknown action."})
}