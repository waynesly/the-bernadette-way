import { db } from "hatchable";
export const access = "admin";
export const methods = ["GET"];
export default async function(req,res){
 const {rows}=await db.query("SELECT id,student_name,class_name,responses,scores,created_at FROM submissions ORDER BY created_at DESC LIMIT 2000");
 res.json({submissions:rows});
}