export const access="public";
export const methods=["POST"];
export default async function(req,res){res.setHeader("Cache-Control","no-store");return res.status(410).json({error:"Teacher access now uses individual Staff Accounts. Sign in at Staff Login.",loginUrl:"/staff-reflection.html"})}