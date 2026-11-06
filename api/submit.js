import { db } from "hatchable";
export const access = "public";
export const methods = ["POST"];
const groups = {"Social Intelligence":[1,48,5,3],"Love":[11,21,41,46],"Kindness":[51,15,92,38],"Fairness":[45,89,55,91],"Teamwork":[72,60,4,79],"Perspective":[17,93,58,13],"Leadership":[88,31,77,36],"Bravery":[43,52,22,62],"Love of Learning":[87,83,74,70],"Curiosity":[90,84,34,78],"Appreciation of Beauty":[96,63,42,82],"Creativity":[16,10,8,9],"Prudence":[29,73,6,53],"Self-regulation":[47,68,59,56],"Forgiveness":[12,19,50,28],"Open-mindedness":[26,40,66,23],"Humility":[75,25,30,65],"Perseverance":[81,71,67,85],"Zest":[76,35,39,33],"Gratitude":[20,86,2,49],"Spirituality":[95,24,7,64],"Hope":[44,27,57,18],"Humour":[54,37,14,80],"Honesty":[94,32,61,69]};
export default async function(req,res){
 const b=req.body||{}, name=String(b.name||"").trim().slice(0,100), clazz=String(b.className||"").trim().slice(0,80), a=b.responses;
 if(!name||!clazz||!Array.isArray(a)||a.length!==96||!a.every(x=>Number.isInteger(x)&&x>=1&&x<=5))return res.status(400).json({error:"Enter your name, class and all 96 ratings."});
 const scores=Object.fromEntries(Object.entries(groups).map(([k,ids])=>[k,ids.reduce((t,id)=>t+a[id-1],0)]));
 const {rows}=await db.query("INSERT INTO submissions (student_name,class_name,responses,scores) VALUES ($1,$2,$3::jsonb,$4::jsonb) RETURNING id,created_at",[name,clazz,JSON.stringify(a),JSON.stringify(scores)]);
 res.json({id:rows[0].id,createdAt:rows[0].created_at,scores});
}