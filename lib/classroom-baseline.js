import { db } from "hatchable";
export const BASELINE_VERSION="classroom-profile-v3";
export const WINDOWS=["move_up_day","term_1_beginning","term_1_mid","term_2_beginning","term_2_mid","term_3_beginning","term_3_mid","term_4_beginning","term_4_mid"];
export const WINDOW_LABELS={"start_of_year":"Start-of-year baseline","mid_year":"Mid-year check-in","end_of_year":"End-of-year reflection","move_up_day":"Move Up Day","term_1_beginning":"Term 1 – Beginning check-in","term_1_mid":"Term 1 – Mid-term check-in","term_2_beginning":"Term 2 – Beginning check-in","term_2_mid":"Term 2 – Mid-term check-in","term_3_beginning":"Term 3 – Beginning check-in","term_3_mid":"Term 3 – Mid-term check-in","term_4_beginning":"Term 4 – Beginning check-in","term_4_mid":"Term 4 – Mid-term check-in"};
export const DOMAINS=[
{id:"belonging_friends",name:"Belonging & friendships",icon:"♡",nextStep:"Choose one small way to connect with someone new or ask for support."},
{id:"collaboration_communication",name:"Collaboration & communication",icon:"✦",nextStep:"Practise listening first, then add one idea that helps the group move forward."},
{id:"learning_approach",name:"Learning approach",icon:"⌁",nextStep:"Choose one learning strategy to try when a task feels challenging."},
{id:"confidence_voice",name:"Confidence & voice",icon:"↗",nextStep:"Share one idea or question, even if you need a little thinking time first."},
{id:"self_regulation",name:"Self-regulation",icon:"◎",nextStep:"Notice one reset strategy that helps you return to learning."},
{id:"contribution_leadership",name:"Contribution & leadership",icon:"☀",nextStep:"Choose one helpful action that makes the classroom work better for others."}];
export const CORE_QUESTIONS=[
{domain:"belonging_friends",text:"When I join a group, I can find a way to take part."},{domain:"belonging_friends",text:"I feel okay asking a classmate or adult for help when I need it."},{domain:"belonging_friends",text:"I can work with someone new, even when it feels unfamiliar."},
{domain:"collaboration_communication",text:"I listen to other people’s ideas before I share mine."},{domain:"collaboration_communication",text:"I can take turns and share jobs when I work with others."},{domain:"collaboration_communication",text:"I can help solve a small problem with a classmate respectfully."},
{domain:"learning_approach",text:"When work feels hard, I can try a strategy instead of giving up."},{domain:"learning_approach",text:"I can get my materials ready and begin learning."},{domain:"learning_approach",text:"I ask questions or seek feedback when it can help me learn."},
{domain:"confidence_voice",text:"I can share an idea, even when I am not completely sure it is right."},{domain:"confidence_voice",text:"I can have another go after I make a mistake."},{domain:"confidence_voice",text:"I can tell someone what I need to help me learn."},
{domain:"self_regulation",text:"When I feel frustrated, I can pause before I act."},{domain:"self_regulation",text:"I can refocus after something distracts me."},{domain:"self_regulation",text:"I can cope when a routine or plan changes."},
{domain:"contribution_leadership",text:"I notice small ways to help our class work well."},{domain:"contribution_leadership",text:"I follow through when I have a responsibility."},{domain:"contribution_leadership",text:"I use kind and respectful words to help our class feel safe."}];
const EXTRA={
start_of_year:[
{domain:"belonging_friends",text:"I know at least one person in this class I can work or play with.",label:"Finding connections"},
{domain:"collaboration_communication",text:"I know how to take turns when I am working with new people.",label:"Working with new people"},
{domain:"learning_approach",text:"I know where I can find what I need for learning.",label:"Knowing learning routines"},
{domain:"confidence_voice",text:"I know it is okay to ask questions in this class.",label:"Feeling safe to ask"},
{domain:"self_regulation",text:"I know a routine that helps me feel ready to learn.",label:"Feeling ready"},
{domain:"contribution_leadership",text:"I know one small job I can do to help our class.",label:"Knowing how to contribute"}],
mid_year:[
{domain:"belonging_friends",text:"I feel like an important part of our class.",label:"Feeling part of the class"},
{domain:"collaboration_communication",text:"I can explain my thinking and make space for other people’s ideas.",label:"Sharing and listening"},
{domain:"learning_approach",text:"I know which learning strategies help me when I feel stuck.",label:"Using strategies"},
{domain:"confidence_voice",text:"I feel more comfortable contributing to class discussions.",label:"Contributing ideas"},
{domain:"self_regulation",text:"I know what helps me reset after a tricky moment.",label:"Resetting after challenges"},
{domain:"contribution_leadership",text:"I can use one of my strengths to make our class better.",label:"Using strengths to lead"}],
end_of_year:[
{domain:"belonging_friends",text:"I help other people feel welcome in our class.",label:"Helping others belong"},
{domain:"collaboration_communication",text:"I can help my group solve a problem fairly.",label:"Helping groups work well"},
{domain:"learning_approach",text:"I can explain a strategy that helps me learn.",label:"Knowing how I learn"},
{domain:"confidence_voice",text:"I can speak up for myself and my learning.",label:"Using my voice"},
{domain:"self_regulation",text:"I can choose a helpful next step when learning is tricky.",label:"Choosing next steps"},
{domain:"contribution_leadership",text:"I can use my strengths to make a positive difference.",label:"Leading through strengths"}]};
for(const id of WINDOWS){EXTRA[id]=EXTRA[id==="move_up_day"||id.endsWith("_beginning")?"start_of_year":"mid_year"].map(q=>({...q}));}
export function questionsForWindow(window){return [...CORE_QUESTIONS,...(EXTRA[window]||EXTRA.start_of_year)]}
export function windowLabel(window){return WINDOW_LABELS[window]||"Classroom check-in"}
const encoder=new TextEncoder();export async function hash(value){const b=new Uint8Array(await crypto.subtle.digest("SHA-256",encoder.encode(String(value))));return [...b].map(x=>x.toString(16).padStart(2,"0")).join("")}
export function cleanText(v,l){return String(v||"").trim().replace(/\s+/g," ").slice(0,l)} export function validCode(v){return /^[A-HJ-NP-Z2-9]{8}$/.test(String(v||""))} export function makeCode(){const a="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",b=new Uint8Array(8);crypto.getRandomValues(b);return [...b].map(x=>a[x%a.length]).join("")}
export function validResponses(v,w){return Array.isArray(v)&&v.length===questionsForWindow(w).length&&v.every(x=>Number.isInteger(x)&&x>=1&&x<=5)}
export function score(v,w){const t={};DOMAINS.forEach(d=>t[d.id]=[]);CORE_QUESTIONS.forEach((q,i)=>t[q.domain].push(v[i]));const domains={};DOMAINS.forEach(d=>{const raw=t[d.id].reduce((a,x)=>a+x,0),average=raw/t[d.id].length;domains[d.id]={name:d.name,raw,average:Number(average.toFixed(1)),band:average>=4?"A current strength":average>=3?"Ready to grow":"An opportunity to practise",next_step:d.nextStep}});return {domains,context:questionsForWindow(w).slice(CORE_QUESTIONS.length).map((q,i)=>({domain:q.domain,label:q.label,average:v[i+CORE_QUESTIONS.length]})),version:BASELINE_VERSION}}
export function studentCode(req){const v=String(req.headers["x-baseline-student"]||"").trim().toUpperCase();return validCode(v)?v:null} export async function classForAccess(id,code){if(!/^[a-f0-9-]{36}$/i.test(String(id||""))||!validCode(code))return null;const {rows}=await db.query("SELECT id,class_name,current_window FROM classroom_baseline_classes WHERE id=$1 AND access_code_hash=$2 LIMIT 1",[id,await hash(code)]);return rows[0]||null} export function domainScores(s){return s?.domains||s||{}}