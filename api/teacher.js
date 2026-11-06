import { db } from "hatchable";
import { verifyToken } from "lib/teacher-auth.js";
export const access = "public";
export const methods = ["GET"];
export default async function(req,res){
 if(!await verifyToken(req))return res.status(401).json({error:"Teacher password required."});
 res.setHeader("Cache-Control","no-store");
 const {rows}=await db.query("SELECT id,student_name,class_name,responses,scores,created_at FROM submissions ORDER BY created_at DESC LIMIT 2000");
 res.json({submissions:rows});
}