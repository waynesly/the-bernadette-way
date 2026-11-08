import {provision} from "lib/annual-classes.js";
export const access="scheduler";export const methods=["POST"];
export default async function(req,res){
 res.setHeader("Cache-Control","no-store");
 const year=new Date().getUTCFullYear();
 const result=await provision(year);
 return res.json({ok:true,...result});
}