const Q=window.STRENGTH_QUESTIONS;
const ratingLabels=['Very much unlike me','Unlike me','Not sure / in between','Like me','Very much like me'];
const strengthInfo={
'Social Intelligence':['◈','Understanding how others feel and respond.','Notice how someone is feeling and help them feel included.'],
'Love':['♥','Caring deeply for people close to you.','Make time to encourage and support someone you care about.'],
'Kindness':['♡','Helping others with care and generosity.','Look for someone who could use a helping hand.'],
'Fairness':['⚖','Giving people a fair chance and treating them equally.','Make sure everyone has a voice in a group decision.'],
'Teamwork':['✦','Working with others towards a shared goal.','Help your team include every person and their ideas.'],
'Perspective':['◉','Seeing the bigger picture and offering wise advice.','Listen to different viewpoints before deciding.'],
'Leadership':['♛','Helping a group move forward together.','Help organise a task while making everyone feel valued.'],
'Bravery':['▲','Doing what matters even when it feels difficult.','Speak up respectfully when something is not right.'],
'Love of Learning':['✎','Finding joy in discovering and mastering new things.','Learn a new skill and share it with someone.'],
'Curiosity':['?','Asking questions and exploring new ideas.','Ask a thoughtful question to discover something new.'],
'Appreciation of Beauty':['✿','Noticing wonder and excellence in the world.','Help others notice something inspiring around them.'],
'Creativity':['✳','Finding original ideas and new ways to do things.','Suggest an imaginative solution to a problem.'],
'Prudence':['◇','Thinking carefully before making a choice.','Consider the consequences before making a big decision.'],
'Self-regulation':['◎','Managing emotions and actions thoughtfully.','Use a calming strategy when a situation gets tricky.'],
'Forgiveness':['☼','Choosing to move forward after being hurt.','Look for a respectful way to repair a friendship.'],
'Open-mindedness':['◐','Considering ideas and perspectives fairly.','Ask someone to explain an opinion different from yours.'],
'Humility':['☁','Letting actions speak without needing to boast.','Celebrate another person’s success.'],
'Perseverance':['↗','Keeping going when things become challenging.','Break a difficult task into smaller achievable steps.'],
'Zest':['☀','Bringing energy and enthusiasm to life.','Bring positive energy to a team challenge.'],
'Gratitude':['✷','Appreciating the good in people and experiences.','Thank someone for something they do for your class.'],
'Spirituality':['✧','Finding meaning and connection beyond yourself.','Reflect on the values that guide your choices.'],
'Hope':['☽','Believing good things are possible and working towards them.','Encourage someone who is facing a challenge.'],
'Humour':['☺','Sharing joy and helping people smile.','Use humour kindly to help others feel at ease.'],
'Honesty':['✓','Being truthful and acting with integrity.','Tell the truth, even when it is difficult.']};
const palette=[['#ece7ff','#7057bc'],['#ffe7e8','#c56683'],['#e3f7ed','#3b9a74'],['#fff0da','#c28c48'],['#e5efff','#628bce']];
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let answers=Array(96).fill(null),page=0,student='',clazz='',results=[],viewRows=[],studentScores=null,submitted=false,submitting=false;
let resumeToken=localStorage.getItem('sos.resume.v1'),progressTimer=null;
function info(name){return strengthInfo[name]||['✦','A strength you can keep growing.','Look for a chance to use this strength.']}
function theme(i){const p=palette[i%palette.length];return '--card-bg:'+p[0]+';--card-fg:'+p[1]}
function sortedScores(scores){return Object.entries(scores).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))}
function jumpTop(){window.scrollTo({top:0,behavior:'smooth'})}
function showTab(t){$('student').hidden=t!=='student';$('teacher').hidden=t!=='teacher';const teacherTab=$('teacherTab');if(teacherTab){teacherTab.hidden=t==='teacher';teacherTab.classList.toggle('active',t==='teacher')}if(t==='teacher')loadTeacher();jumpTop()}
async function start(){
 if(submitted)return;
 const code=$('year5JoinCode').value.trim().toUpperCase();
 if(!code){$('welcomeError').textContent='Enter the join code your teacher gave you.';return}
 $('welcomeError').textContent='';
 try{
   const login=await fetch('/api/year5-login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({joinCode:code})});
   const identity=await login.json();
   if(!login.ok)throw Error(identity.error||'We could not find that student code.');
   student=identity.student.name;clazz=identity.student.className;resumeToken=identity.resumeToken;localStorage.setItem('sos.resume.v1',resumeToken);
   const restored=await fetch('/api/progress',{headers:{'X-Strengths-Resume':resumeToken}});
   if(restored.ok){
     const data=await restored.json(),saved=data.progress;
     answers=saved.responses.concat(Array(Math.max(0,96-saved.responses.length)).fill(null)).slice(0,96);
     page=Math.min(Math.max(0,saved.current_question||0),95);
     $('welcome').hidden=true;
     if(saved.completed_at&&saved.completed_scores){submitted=true;studentScores=saved.completed_scores;$('result').hidden=false;renderResults(saved.completed_scores);jumpTop();return}
     $('quiz').hidden=false;renderPage();jumpTop();return;
   }
   const created=await fetch('/api/progress',{method:'POST',headers:{'Content-Type':'application/json','X-Strengths-Resume':resumeToken},body:JSON.stringify({responses:answers,currentQuestion:0})});
   const data=await created.json();if(!created.ok)throw Error(data.error||'Unable to prepare your saved progress.');
   $('welcome').hidden=true;$('quiz').hidden=false;renderPage();jumpTop();
 }catch(e){$('welcomeError').textContent=e.message||'We could not prepare your saved progress. Please try again.'}
}
function scheduleProgressSave(){
 if(!resumeToken||submitted)return;
 clearTimeout(progressTimer);
 progressTimer=setTimeout(async()=>{
   try{await fetch('/api/progress',{method:'POST',headers:{'Content-Type':'application/json','X-Strengths-Resume':resumeToken},body:JSON.stringify({name:student,className:clazz,responses:answers,currentQuestion:page})})}catch(e){}
 },350);
}
function renderPage(){const n=page;const answered=answers.filter(x=>x!==null).length;const current=answers[n];$('stageLabel').textContent='YOUR DISCOVERY JOURNEY';$('counter').textContent=String(n+1).padStart(2,'0')+' / 96';$('progressFill').style.width=(answered/96*100)+'%';$('progress').setAttribute('aria-valuenow',answered);$('progressPercent').textContent=Math.round(answered/96*100)+'% complete';$('milestoneLabel').textContent=answered>=72?'Almost there — keep going!':answered>=48?'You’re more than halfway through!':answered>=24?'Your strengths picture is taking shape.':'Every answer helps tell your story.';$('questionList').innerHTML='<article class="question-card"><div class="question-decoration"></div><div class="eyebrow">✧ DISCOVERING YOU</div><p class="question-number">STATEMENT '+(n+1)+'</p><h2 class="question-title">'+esc(Q[n])+'</h2><div class="rating-caption"><span>Not like me</span><span>Very much like me</span></div><div class="choices" role="group" aria-label="Choose how much this describes you">'+ratingLabels.map((label,k)=>'<button type="button" class="choice '+(current===k+1?'selected':'')+'" aria-pressed="'+(current===k+1)+'" data-v="'+(k+1)+'"><strong>'+(k+1)+'</strong><span>'+esc(label)+'</span></button>').join('')+'</div></article>';$('questionList').querySelectorAll('[data-v]').forEach(b=>b.addEventListener('click',()=>{answerQuestion(n,Number(b.dataset.v));return;answers[n]=Number(b.dataset.v);scheduleProgressSave();$('questionList').querySelectorAll('[data-v]').forEach(c=>{const selected=Number(c.dataset.v)===answers[n];c.classList.toggle('selected',selected);c.setAttribute('aria-pressed',selected)});$('nextBtn').disabled=false;const count=answers.filter(x=>x!==null).length;$('progressFill').style.width=(count/96*100)+'%';$('progress').setAttribute('aria-valuenow',count);$('progressPercent').textContent=Math.round(count/96*100)+'% complete'}));$('nextBtn').disabled=current===null||submitting;$('nextBtn').innerHTML=n===95?'Reveal my strengths <span>✦</span>':'Continue <span>→</span>';$('quizError').textContent=''}
function answerQuestion(n,value){if(submitting||n!==page)return;answers[n]=value;scheduleProgressSave();if(page<95){page++;renderPage();jumpTop()}else{renderPage()}}
document.addEventListener('keydown',event=>{const tag=document.activeElement?.tagName;if(event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey||tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||$('quiz').hidden||submitted||submitting)return;const value=Number(event.key);if(Number.isInteger(value)&&value>=1&&value<=5){event.preventDefault();answerQuestion(page,value)}})
function prev(){if(page>0&&!submitting){page--;renderPage();jumpTop()}}
async function next(){if(submitting)return;if(answers[page]===null){$('quizError').textContent='Choose a response to continue.';return}if(page<95){page++;renderPage();jumpTop();return}if(answers.some(a=>a===null)){page=answers.findIndex(x=>x===null);renderPage();jumpTop();return}submitting=true;$('nextBtn').disabled=true;$('nextBtn').textContent='Saving your answers…';try{const r=await fetch('/api/submit',{method:'POST',headers:{'Content-Type':'application/json','X-Strengths-Resume':resumeToken||''},body:JSON.stringify({name:student,className:clazz,responses:answers})});const d=await r.json();if(!r.ok)throw Error(d.error||'Unable to save');
submitted=true;studentScores=d.scores;$('quiz').hidden=true;$('result').hidden=false;renderResults(d.scores);jumpTop()}catch(e){$('quizError').textContent='Your answers were not saved. Please try again. '+e.message;submitting=false;renderPage();$('quizError').textContent='Your answers were not saved. Please try again.'}}
function renderResults(scores){const top=sortedScores(scores);$('resultIntro').textContent=student+', these are the strengths that stood out most in your answers. They are all part of your unique story.';$('topResults').innerHTML=top.slice(0,5).map(([name,value],i)=>{const [icon,desc,action]=info(name);return '<article class="strength-card" style="'+theme(i)+'"><div class="symbol">'+icon+'</div><span class="rank">STRENGTH '+String(i+1).padStart(2,'0')+'</span><h3>'+esc(name)+'</h3><p>'+esc(desc)+'</p><span class="score-pill">'+value+' / 20</span><details><summary>Try this in leadership</summary><p>'+esc(action)+'</p></details></article>'}).join('');$('allResults').innerHTML=top.map(([name,value],i)=>'<div class="strength-row" style="'+theme(i)+'"><div class="tiny-icon">'+info(name)[0]+'</div><div><b>'+esc(name)+'</b><div class="strength-meter"><div style="width:'+(value/20*100)+'%"></div></div></div><small>'+value+' / 20</small></div>').join('')};renderPractice(scores)
async function teacherLogin(){const input=$('teacherPassword'),password=input.value;if(!password){$('teacherMessage').textContent='Enter the teacher password, then try again.';input.focus();return}$('teacherMessage').textContent='Checking password…';try{const r=await fetch('/api/teacher-login',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});const d=await r.json();if(!r.ok){$('teacherMessage').textContent=d.error||'Sign in failed. Please check the password and try again.';input.focus();return}input.value='';$('teacherMessage').textContent='';await loadTeacher()}catch(e){$('teacherMessage').textContent='Could not contact the teacher sign-in service. Please refresh the page and try again.'}}
async function teacherLogout(){try{await fetch('/api/teacher-logout',{method:'POST'})}catch(e){}results=[];viewRows=[];$('teacherData').hidden=true;$('teacherGate').hidden=false;$('teacherMessage').textContent='';$('printArea').innerHTML='';}
async function loadTeacher(){try{const r=await fetch('/api/teacher',{credentials:'same-origin',cache:'no-store'});if(!r.ok){results=[];viewRows=[];$('teacherGate').hidden=false;$('teacherData').hidden=true;$('teacherMessage').textContent=r.status===401?'Enter your teacher password to view the dashboard.':'Unable to load teacher records ('+r.status+'). Please try Refresh.';return false}const data=await r.json();results=Array.isArray(data.submissions)?data.submissions:[];$('teacherGate').hidden=true;$('teacherData').hidden=false;$('total').textContent=results.length;$('classes').textContent=new Set(results.map(r=>r.class_name)).size;const current=$('classFilter').value;$('classFilter').innerHTML='<option value="">All classes</option>'+[...new Set(results.map(x=>x.class_name))].sort().map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join('');$('classFilter').value=current;try{renderTeacher()}catch(e){console.error('Teacher dashboard renderer failed',e);viewRows=results.slice();$('filteredCount').textContent='Showing '+results.length+' saved profiles';$('cohortChart').innerHTML='<p class="muted">Cohort charts are temporarily unavailable. Student profiles remain available below.</p>';$('virtueChart').innerHTML='';$('commonStrength').textContent='—';$('submissionList').innerHTML=results.map(r=>'<article class="submission"><div class="avatar">'+esc(r.student_name?.[0]?.toUpperCase()||'S')+'</div><div><b>'+esc(r.student_name||'Student')+' <span class="muted">· '+esc(r.class_name||'')+'</span></b><p>Saved strengths profile</p></div><button class="secondary" data-report="'+esc(r.id)+'">View PDF ↗</button></article>').join('')||'<p class="muted">No student profiles have been submitted yet.</p>';$('submissionList').querySelectorAll('[data-report]').forEach(b=>b.addEventListener('click',()=>printReports(b.dataset.report)))}return true}catch(e){console.error('Teacher dashboard request failed',e);results=[];viewRows=[];$('teacherGate').hidden=false;$('teacherData').hidden=true;$('teacherMessage').textContent='The teacher dashboard could not load. Please refresh the page and try again.';return false}}
function renderTeacher(){const filter=$('classFilter').value,search=$('search').value.toLowerCase();viewRows=results.filter(r=>(!filter||r.class_name===filter)&&r.student_name.toLowerCase().includes(search));$('filteredCount').textContent='Showing '+viewRows.length+' of '+results.length+' saved profiles';const counts={};viewRows.forEach(r=>sortedScores(r.scores).slice(0,5).forEach(([name])=>counts[name]=(counts[name]||0)+1));const top=Object.entries(counts).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));$('commonStrength').textContent=top[0]?.[0]||'—';const max=top[0]?.[1]||1;$('cohortChart').innerHTML=top.length?top.slice(0,7).map(([name,n])=>'<div class="bar-row"><span class="bar-label" title="'+esc(name)+'">'+esc(name)+'</span><div class="bar-track"><div class="bar-fill" style="width:'+(n/max*100)+'%"></div></div><span class="bar-value">'+n+'</span></div>').join(''):'<p class="muted">When students submit their responses, you’ll see the most common top strengths here.</p>';$('submissionList').innerHTML=viewRows.length?viewRows.map(r=>{const top=sortedScores(r.scores)[0];return '<article class="submission"><div class="avatar">'+esc(r.student_name[0]?.toUpperCase()||'S')+'</div><div><b>'+esc(r.student_name)+' <span class="muted">· '+esc(r.class_name)+'</span></b><p>'+new Date(r.created_at).toLocaleString('en-AU')+' · Leading strength: '+esc(top?.[0]||'')+'</p></div><button class="secondary" data-report="'+esc(r.id)+'">View PDF ↗</button></article>'}).join(''):'<div class="note-card"><span>✦</span><p>No students match these filters yet.</p></div>';$('submissionList').querySelectorAll('[data-report]').forEach(b=>b.addEventListener('click',()=>printReports(b.dataset.report)));renderVirtueChart(viewRows)}
const challengeLibrary=[
 {title:'Invite every voice',strengths:['Teamwork','Fairness','Social Intelligence'],action:'In your next group task, ask someone quiet what they think before your team decides.',prompt:'How did making space for another idea change the group?'},
 {title:'Choose the kind response',strengths:['Kindness','Love','Forgiveness'],action:'Notice a moment when someone needs encouragement. Offer a specific, genuine kind action.',prompt:'What did you notice about the other person’s reaction?'},
 {title:'Ask a better question',strengths:['Curiosity','Love of Learning','Perspective'],action:'Ask one thoughtful question that helps your class understand a problem or idea more deeply.',prompt:'What did your question help people discover?'},
 {title:'Keep going together',strengths:['Perseverance','Zest','Hope'],action:'When a task feels hard, name one small next step and encourage a teammate to take it with you.',prompt:'What helped you and your team keep going?'},
 {title:'Lead with care',strengths:['Leadership','Humility','Honesty'],action:'Help organise a group task while checking that the plan is fair and everyone understands their role.',prompt:'How did you balance leading and listening?'},
 {title:'Pause before deciding',strengths:['Prudence','Self-regulation','Open-mindedness'],action:'Before a tricky choice, pause and think of two possible outcomes and one other point of view.',prompt:'How did pausing change your choice?'},
 {title:'Stand up for what is right',strengths:['Bravery','Fairness','Honesty'],action:'Practise a respectful sentence you could use when someone is left out or treated unfairly.',prompt:'What words helped you be brave and respectful?'},
 {title:'Notice the good',strengths:['Gratitude','Appreciation of Beauty','Humour'],action:'Share one specific thing that made your class, team or day better, and thank someone involved.',prompt:'How did noticing the good affect the people around you?'}
];
function renderPractice(scores){
 const ranked=sortedScores(scores),topNames=ranked.slice(0,5).map(item=>item[0]);
 const recommended=challengeLibrary.filter(challenge=>challenge.strengths.some(strength=>topNames.includes(strength))).slice(0,3);
 const cards=(recommended.length?recommended:challengeLibrary.slice(0,3));
 $('leadershipChallenges').innerHTML=cards.map((challenge,index)=>'<article class="challenge-card"><span class="challenge-number">CHALLENGE '+String(index+1).padStart(2,'0')+'</span><h3>'+esc(challenge.title)+'</h3><div class="challenge-tags">'+challenge.strengths.map(strength=>'<span>'+esc(strength)+'</span>').join('')+'</div><p>'+esc(challenge.action)+'</p><p class="challenge-prompt"><b>Reflect:</b> '+esc(challenge.prompt)+'</p></article>').join('');
 const select=$('reflectionStrength');
 if(!select.options.length)select.innerHTML='<option value="">Choose a strength…</option>'+ranked.map(([name])=>'<option value="'+esc(name)+'">'+esc(name)+'</option>').join('');
 loadReflections();
}
async function loadReflections(){
 if(!resumeToken){$('reflectionList').innerHTML='';return}
 try{
   const response=await fetch('/api/reflections',{headers:{'X-Strengths-Resume':resumeToken}});
   const data=await response.json();
   if(!response.ok){$('reflectionList').innerHTML='';return}
   $('reflectionList').innerHTML=(data.reflections||[]).map(reflection=>'<article class="saved-reflection"><span class="eyebrow">'+esc(reflection.strength_id)+(reflection.selected_for_report?' · SELECTED FOR REPORT':'')+'</span><p><b>I used it:</b> '+esc(reflection.how_used)+'</p><p><b>I learned:</b> '+esc(reflection.learned)+'</p><p><b>Next goal:</b> '+esc(reflection.future_goal)+'</p></article>').join('')||'<p class="muted">Your saved reflections will appear here.</p>';
 }catch(error){$('reflectionList').innerHTML=''}
}
async function saveReflection(){
 const message=$('reflectionMessage');
 if(!resumeToken){message.textContent='Please return to your completed strengths profile on this browser to save a reflection.';return}
 message.textContent='Saving…';
 try{
   const response=await fetch('/api/reflections',{method:'POST',headers:{'Content-Type':'application/json','X-Strengths-Resume':resumeToken},body:JSON.stringify({
     strengthId:$('reflectionStrength').value,howUsed:$('reflectionHow').value,whatHappened:$('reflectionWhat').value,
     impactOnOthers:$('reflectionImpact').value,learned:$('reflectionLearned').value,futureGoal:$('reflectionGoal').value,
     selectedForReport:$('reflectionReport').checked
   })});
   const data=await response.json();
   if(!response.ok)throw Error(data.error||'Unable to save your reflection.');
   ['reflectionHow','reflectionWhat','reflectionImpact','reflectionLearned','reflectionGoal'].forEach(id=>$(id).value='');
   $('reflectionReport').checked=false;$('reflectionStrength').value='';message.textContent='Your reflection is saved.';
   await loadReflections();
 }catch(error){message.textContent=error.message||'Unable to save your reflection.'}
}
const virtueGroups={
  Wisdom:['Creativity','Curiosity','Open-mindedness','Love of Learning','Perspective'],
  Courage:['Bravery','Perseverance','Honesty','Zest'],
  Humanity:['Love','Kindness','Social Intelligence'],
  Justice:['Teamwork','Fairness','Leadership'],
  Temperance:['Forgiveness','Humility','Prudence','Self-regulation'],
  Transcendence:['Appreciation of Beauty','Gratitude','Hope','Humour','Spirituality']
};
function renderVirtueChart(rows){
 const target=$('virtueChart');if(!target)return;
 if(!rows.length){target.innerHTML='<p class="muted">Virtue patterns will appear when submitted profiles match this filter.</p>';return}
 const values=Object.entries(virtueGroups).map(([virtue,strengths])=>{
   const sum=rows.reduce((rowTotal,row)=>rowTotal+strengths.reduce((total,strength)=>total+Number(row.scores?.[strength]||0),0),0);
   return [virtue,sum/(rows.length*strengths.length)];
 });
 target.innerHTML=values.map(([virtue,value])=>'<div class="virtue-row"><span>'+esc(virtue)+'</span><div><i style="width:'+Math.round(value/20*100)+'%"></i></div><b>'+value.toFixed(1)+'</b></div>').join('');
}
function buildTeams(){
 const target=$('teamResults'),size=Math.min(8,Math.max(2,Number($('teamSize').value)||4)),students=viewRows.slice();
 if(!students.length){target.innerHTML='<p class="muted">There are no students in the current filter.</p>';return}
 const groupCount=Math.ceil(students.length/size);
 students.sort((left,right)=>{
   const a=sortedScores(left.scores)[0]?.[0]||'',b=sortedScores(right.scores)[0]?.[0]||'';
   return a.localeCompare(b)||left.student_name.localeCompare(right.student_name);
 });
 const groups=Array.from({length:groupCount},()=>[]);
 students.forEach((student,index)=>groups[index%groupCount].push(student));
 target.innerHTML=groups.map((group,index)=>'<article class="team-card"><b>Team '+(index+1)+'</b><ul>'+group.map(student=>'<li>'+esc(student.student_name)+' <small>'+esc(sortedScores(student.scores)[0]?.[0]||'')+'</small></li>').join('')+'</ul></article>').join('');
}
function reportMarkup(r,full=true){const sorted=sortedScores(r.scores);return '<section class="printreport"><p class="eyebrow">✳ SCIENCE OF STRENGTHS · YEAR 5 LEADERSHIP DAY</p><h2>'+esc(r.student_name)+' — My Strengths Profile</h2><p class="muted">Class: '+esc(r.class_name)+(r.created_at?' · '+new Date(r.created_at).toLocaleDateString('en-AU'):'')+'</p><div class="report-topline"><strong>My top five strengths</strong><div class="printcols">'+sorted.slice(0,5).map(([name,value],i)=>'<div>'+(i+1)+'. <b>'+esc(name)+'</b> · '+value+'/20</div>').join('')+'</div></div><h3>Putting my strengths into action</h3><div class="printcols">'+sorted.slice(0,5).map(([name])=>'<div><b>'+esc(name)+'</b> — '+esc(info(name)[2])+'</div>').join('')+'</div><h3>All 24 character strengths</h3><div class="printcols">'+sorted.map(([name,v])=>'<div>'+esc(name)+': <b>'+v+'/20</b></div>').join('')+'</div>'+((r.selected_reflections||[]).length?'<h3>My selected leadership reflections</h3><div class="printcols">'+r.selected_reflections.map(reflection=>'<div><b>'+esc(reflection.strength_id)+'</b> — '+esc(reflection.learned)+'<br><i>Next goal:</i> '+esc(reflection.future_goal)+'</div>').join('')+'</div>':'')+(full?'<h3>All 96 questionnaire responses</h3><table class="printtable"><thead><tr><th>No.</th><th>Statement</th><th>Rating /5</th></tr></thead><tbody>'+Q.map((q,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(q)+'</td><td>'+r.responses[i]+'</td></tr>').join('')+'</tbody></table>':'')+'<p class="muted">For reflection and discussion only. Self-report results are not a diagnosis or a fixed measure of ability.</p></section>'}
function printNow(markup,studentOnly=false){$('printArea').className=studentOnly?'student-print':'';$('printArea').innerHTML=markup;window.print();window.addEventListener('afterprint',()=>{$('printArea').innerHTML='';$('printArea').className=''}, {once:true})}
function printStudentResult(){if(!submitted||!studentScores)return;printNow(reportMarkup({student_name:student,class_name:clazz,scores:studentScores,responses:answers},false),true)}
function printReports(id){const arr=id?results.filter(r=>String(r.id)===String(id)):viewRows;if(!arr.length){alert('No reports to export.');return}printNow(arr.map(r=>reportMarkup(r,true)).join(''))}