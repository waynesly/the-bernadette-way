import { db } from "hatchable";

export const BASELINE_VERSION = "classroom-baseline-v2";
export const WINDOWS = ["start_of_year","mid_year","end_of_year"];
export const DOMAINS = [
  {id:"belonging",name:"Belonging",icon:"♡",description:"Feeling included and helping others feel they belong.",nextStep:"Notice one person who may feel left out and invite them in."},
  {id:"self_management",name:"Self-management",icon:"◎",description:"Managing feelings, choices and learning habits.",nextStep:"When something feels tricky, pause, breathe and choose one helpful next step."},
  {id:"collaboration",name:"Collaboration",icon:"✦",description:"Listening, contributing and working well with others.",nextStep:"In your next group task, build on one other person's idea."},
  {id:"learning_confidence",name:"Learning confidence",icon:"↗",description:"Having a go, learning from mistakes and asking for help.",nextStep:"Choose one new or tricky thing to try, then notice what helps you keep going."},
  {id:"contribution",name:"Contribution",icon:"☀",description:"Using your actions to help the class community.",nextStep:"Choose one small way to make your classroom better today."}
];
export const CORE_QUESTIONS = [
  {domain:"belonging",text:"When I join a group, I can find a way to take part."},
  {domain:"belonging",text:"I try to include someone who is on their own."},
  {domain:"self_management",text:"When I feel frustrated, I can calm myself before I act."},
  {domain:"self_management",text:"I can get ready and stay focused for learning."},
  {domain:"collaboration",text:"I listen when someone in my group has an idea."},
  {domain:"collaboration",text:"I do my part when my class or group has a job to do."},
  {domain:"learning_confidence",text:"I will have a go even when I am not sure I will get it right."},
  {domain:"learning_confidence",text:"I ask for help or try a new strategy when learning is hard."},
  {domain:"contribution",text:"I look for small ways to help our class work well."},
  {domain:"contribution",text:"I use kind and respectful words to help our class feel safe."}
];
const WINDOW_QUESTIONS = {
  start_of_year:[
    {domain:"belonging",text:"I know someone in our class I can work with.",label:"Working with new people"},
    {domain:"self_management",text:"I know where I can find what I need for learning.",label:"Knowing routines"},
    {domain:"collaboration",text:"I know how to take turns when I work with new people.",label:"Taking turns"},
    {domain:"learning_confidence",text:"I know it is okay to ask questions in this class.",label:"Asking questions"},
    {domain:"contribution",text:"I know one small job I can do to help our class.",label:"Helping our class"}
  ],
  mid_year:[
    {domain:"belonging",text:"I know who I can ask for help when I need it.",label:"Knowing where to get help"},
    {domain:"self_management",text:"I know routines that help me get ready to learn.",label:"Using routines"},
    {domain:"collaboration",text:"I can solve a small problem with a classmate respectfully.",label:"Solving problems together"},
    {domain:"learning_confidence",text:"I know what I can try when I feel stuck with learning.",label:"Using learning strategies"},
    {domain:"contribution",text:"I can see ways to make our class a better place.",label:"Improving our class"}
  ],
  end_of_year:[
    {domain:"belonging",text:"I help other people feel welcome in our class.",label:"Helping others belong"},
    {domain:"self_management",text:"I can choose a helpful next step when learning is tricky.",label:"Choosing next steps"},
    {domain:"collaboration",text:"I can help my group solve a problem fairly.",label:"Helping groups work fairly"},
    {domain:"learning_confidence",text:"I can explain a strategy that helps me learn.",label:"Knowing learning strategies"},
    {domain:"contribution",text:"I can use my strengths to make our class better.",label:"Using strengths to contribute"}
  ]
};
export function questionsForWindow(window){return [...CORE_QUESTIONS,...(WINDOW_QUESTIONS[window]||WINDOW_QUESTIONS.start_of_year)];}
export function windowLabel(window){return window==="mid_year"?"Mid-year check-in":window==="end_of_year"?"End-of-year reflection":"Start-of-year baseline";}
const encoder=new TextEncoder();
export async function hash(value){const bytes=new Uint8Array(await crypto.subtle.digest("SHA-256",encoder.encode(String(value))));return [...bytes].map(x=>x.toString(16).padStart(2,"0")).join("")}
export function cleanText(value,limit){return String(value||"").trim().replace(/\s+/g," ").slice(0,limit)}
export function validCode(value){return /^[A-HJ-NP-Z2-9]{8}$/.test(String(value||""))}
export function makeCode(){const alphabet="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";const bytes=new Uint8Array(8);crypto.getRandomValues(bytes);return [...bytes].map(byte=>alphabet[byte%alphabet.length]).join("")}
export function validResponses(values,window){return Array.isArray(values)&&values.length===questionsForWindow(window).length&&values.every(value=>Number.isInteger(value)&&value>=1&&value<=5)}
export function score(values,window){
  const totals={};DOMAINS.forEach(domain=>totals[domain.id]=[]);
  CORE_QUESTIONS.forEach((question,index)=>totals[question.domain].push(values[index]));
  const context=questionsForWindow(window).slice(CORE_QUESTIONS.length).map((question,index)=>({domain:question.domain,label:question.label,average:values[index+CORE_QUESTIONS.length]}));
  const domains={};DOMAINS.forEach(domain=>{const raw=totals[domain.id].reduce((sum,value)=>sum+value,0);const average=raw/totals[domain.id].length;domains[domain.id]={name:domain.name,raw,average:Number(average.toFixed(1)),band:average>=4?"A current strength":average>=3?"Ready to grow":"An opportunity to practise",next_step:domain.nextStep}});
  return {domains,context,version:BASELINE_VERSION};
}
export function studentCode(req){const value=String(req.headers["x-baseline-student"]||"").trim().toUpperCase();return validCode(value)?value:null}
export async function classForAccess(classId,accessCode){if(!/^[a-f0-9-]{36}$/i.test(String(classId||""))||!validCode(accessCode))return null;const {rows}=await db.query("SELECT id,class_name,current_window FROM classroom_baseline_classes WHERE id=$1 AND access_code_hash=$2 LIMIT 1",[classId,await hash(accessCode)]);return rows[0]||null}
export function domainScores(stored){return stored?.domains||stored||{}}
export function summary(stored){const ordered=Object.entries(domainScores(stored)).sort((a,b)=>b[1].average-a[1].average);return {strengths:ordered.filter(([,value])=>value.average>=3).slice(0,2).map(([id])=>id),opportunities:ordered.filter(([,value])=>value.average<3).map(([id])=>id).slice(0,2)};}