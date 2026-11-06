import {config,db} from "hatchable";
const enc=new TextEncoder();
function hex(bytes){return [...bytes].map(b=>b.toString(16).padStart(2,"0")).join("")}
async function digest(s){return hex(new Uint8Array(await crypto.subtle.digest("SHA-256",enc.encode(s))))}
async function key(){return await config.get("TEACHER_PASSWORD")}
export async function passwordMatches(value){const expected=await key();if(!expected||String(expected).length<12)return false;const a=await digest("teacher:"+String(value||"")),b=await digest("teacher:"+expected);let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0}
function cookieToken(req){const raw=String(req.headers.cookie||"").split(";").map(s=>s.trim()).find(s=>s.startsWith("strength_teacher="));if(!raw)return null;let token;try{token=decodeURIComponent(raw.slice("strength_teacher=".length))}catch{return null}return /^[a-f0-9-]{72}$/.test(token)?token:null}
export async function signToken(){const {rows}=await db.query("SELECT gen_random_uuid()::text AS a, gen_random_uuid()::text AS b");const token=rows[0].a+rows[0].b;await db.query("INSERT INTO teacher_sessions(token_hash,expires_at) VALUES($1,now()+interval '4 hours')",[await digest(token)]);return token}
export async function verifyToken(req){const token=cookieToken(req);if(!token)return false;const {rows}=await db.query("SELECT 1 FROM teacher_sessions WHERE token_hash=$1 AND expires_at>now() LIMIT 1",[await digest(token)]);return rows.length>0}
export async function revokeToken(req){const token=cookieToken(req);if(token)await db.query("DELETE FROM teacher_sessions WHERE token_hash=$1",[await digest(token)])}