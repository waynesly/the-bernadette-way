(()=>{
const $=id=>document.getElementById(id),token=()=>sessionStorage.getItem("bernadette.staff.session");
let newCards=[];
$("year").value=new Date().getFullYear();
async function api(action,data={}){
 const response=await fetch("/api/annual-roster",{method:"POST",credentials:"same-origin",cache:"no-store",headers:{"Content-Type":"application/json",...(token()?{"X-Staff-Session":token()}:{})},body:JSON.stringify({action,year:Number($("year").value),...data})});
 const obj=await response.json().catch(()=>({}));
 if(!response.ok)throw Error(obj.error||"Request failed");
 return obj;
}
function msg(x){$("status").textContent=x}
function csv(text){
 const rows=[];let row=[],cell="",quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++}else quoted=!quoted}
 else if(c===","&&!quoted){row.push(cell);cell=""}
 else if((c==="\n"||c==="\r")&&!quoted){if(c==="\r"&&text[i+1]==="\n")i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell=""}
 else cell+=c}
 if(quoted)throw Error("CSV has an unclosed quote.");
 row.push(cell);if(row.some(x=>x.trim()))rows.push(row);
 const headers=(rows.shift()||[]).map(s=>s.trim().replace(/^\ufeff/,"").toLowerCase());
 const index=names=>names.map(n=>headers.indexOf(n)).find(x=>x>=0);
 const idx={studentId:index(["code","student id","studentid"]),firstName:index(["first name","firstname"]),surname:index(["surname","last name"]),year:index(["year","year level"]),className:index(["rollgroup","roll group","class"])};
 if(Object.values(idx).some(i=>i===undefined))throw Error("CSV needs Code, First name, Surname, Year and Rollgroup columns.");
 return rows.map(row=>Object.fromEntries(Object.entries(idx).map(([key,i])=>[key,(row[i]||"").trim()])));
}
async function check(){const data=await api("status");const summary=$("summary");summary.replaceChildren();const p=document.createElement("p");p.textContent=data.classes.baseline.length+" of 8 Years 3–6 classes and "+data.classes.leadership.length+" of 2 Year 5 leadership classes exist for "+data.year+".";summary.append(p);const table=document.createElement("table"),head=document.createElement("tr");for(const s of ["Section","Class","Students"]){const th=document.createElement("th");th.textContent=s;head.append(th)}table.append(head);for(const [kind,rows] of [["Years 3–6",data.classes.baseline],["Year 5 leadership",data.classes.leadership]])for(const c of rows){const tr=document.createElement("tr");for(const value of [kind,c.class_name,c.count]){const td=document.createElement("td");td.textContent=value;tr.append(td)}table.append(tr)}summary.append(table)}
async function action(fn){const btn=$(fn);btn.disabled=true;try{msg("");if(fn==="check")await check();else if(fn==="provision"){const data=await api("provision");msg(data.created_count+" new classes created for "+data.year+"; existing classes left unchanged.");await check()}else{
 const f=$("csv").files[0];if(!f)throw Error("Choose a CSV file.");if(f.size>150000)throw Error("CSV exceeds the size limit.");
 const students=csv(await f.text());if(!students.length||students.length>500)throw Error("CSV must contain 1–500 students.");
 const year=Number($("year").value);if(!confirm("Import "+students.length+" students into "+year+"? Existing records for this year will be retained, and Year 5 will have two separate sections."))return;
 newCards=[];$("result").hidden=true;
 const started=performance.now(),batchSize=20,progress=$("import-progress"),bar=$("import-bar"),meter=$("import-meter"),clock=$("import-clock");
 const summary={created:0,skipped:0,year5Created:0};let processed=0;
 progress.hidden=false;bar.max=students.length;bar.value=0;
 const formatTime=seconds=>{const n=Math.max(0,Math.round(seconds));return Math.floor(n/60)+"m "+String(n%60).padStart(2,"0")+"s"};
 const update=()=>{const elapsed=(performance.now()-started)/1000,percent=Math.floor(100*processed/students.length),remaining=processed?elapsed*(students.length-processed)/processed:null;bar.value=processed;meter.textContent=processed+" / "+students.length+" students ("+percent+"%)";clock.textContent="Elapsed: "+formatTime(elapsed)+(remaining===null?" · Estimating time remaining…":" · Estimated remaining: "+formatTime(remaining))};
 update();
 for(let offset=0;offset<students.length;offset+=batchSize){
  const batch=students.slice(offset,offset+batchSize);
  let data;
  for(let attempt=0;attempt<3;attempt++){
   try{data=await api("import",{students:batch});break}catch(error){
    if(attempt===2)throw Error("Import paused after "+processed+" of "+students.length+" students. "+error.message+" Download any new codes shown below before retrying; existing records will be skipped.");
    await new Promise(resolve=>setTimeout(resolve,1500*(attempt+1)));
   }
  }
  summary.created+=data.created;summary.skipped+=data.skipped;summary.year5Created+=data.year5Created;
  newCards.push(...data.joinCards);$("result").hidden=!newCards.length;
  processed+=batch.length;update();
  // Small pause between batches to leave capacity for teachers and students.
  if(processed<students.length)await new Promise(resolve=>setTimeout(resolve,350));
 }
 msg("Finished in "+formatTime((performance.now()-started)/1000)+". Imported "+summary.created+" Years 3–6 students and "+summary.year5Created+" Year 5 leadership records; skipped "+summary.skipped+" existing students. "+(newCards.length?"Download the NEW join codes immediately.":"No new codes were generated."));await check()
 }}catch(e){msg(e.message)}finally{btn.disabled=false}}
["check","provision","import"].forEach(id=>$(id).onclick=()=>action(id));
$("download").onclick=()=>{if(!newCards.length)return;
 const quote=x=>'"'+String(x??"").replace(/"/g,'""')+'"';
 const data=[["Pathway","Student ID","Student name","Class","Join code"],...newCards.map(c=>[c.pathway,c.studentId,c.studentName,c.className,c.joinCode])].map(r=>r.map(quote).join(",")).join("\r\n");
 const blob=new Blob(["\ufeff"+data],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="bernadette-join-codes-"+$("year").value+".csv";a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);
};
check().catch(e=>msg("Administrator sign-in required. Open Administration and sign in before using this screen."));
})();