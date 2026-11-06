import {passwordMatches,signToken} from "lib/teacher-auth.js";
import {db} from "hatchable";
export const access="public";
export const methods=["POST"];
export default async function(req,res){const ip=String(req.headers["x-forwarded-for"]||req.headers["cf-connecting-ip"]||"unknown").split(",")[0].trim().slice(0,100);
 const {rows}=await db.query("SELECT COUNT(*)::int AS n FROM teacher_login_attempts WHERE client_ip=$1 AND created_at>now()-interval '15 minutes'",[ip]);
 if(rows[0].n>=10)return res.status(429).json({error:"Too many attempts. Try again later."});
 const good=await passwordMatches(req.body?.password);
 if(!good){await db.query("INSERT INTO teacher_login_attempts(client_ip) VALUES ($1)",[ip]);return res.status(401).json({error:"Incorrect teacher password."})}
 await db.query("DELETE FROM teacher_login_attempts WHERE client_ip=$1",[ip]);
 res.cookie("strength_teacher",await signToken(),{httpOnly:true,secure:true,sameSite:"strict",path:"/",maxAge:4*60*60*1000});res.json({ok:true});
}