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
let selectedTeacherClasses=new Set((new URLSearchParams(location.search).get('classes')||'').split('|').filter(Boolean));
let resumeToken=localStorage.getItem('sos.resume.v1'),progressTimer=null;
function info(name){return strengthInfo[name]||['✦','A strength you can keep growing.','Look for a chance to use this strength.']}
const homeExamples={
'Appreciation of Beauty':'Take a short walk together and each point out one beautiful, skilful or thoughtful thing you notice.',
'Bravery':'Talk through a small challenge and practise a respectful sentence they could use to face it.',
'Creativity':'Invite them to invent a new game, recipe, story ending or solution to a household problem.',
'Curiosity':'Follow one of their questions together by looking it up, testing an idea or visiting the library.',
'Fairness':'When making a family decision, ask everyone what would feel fair and listen to each view.',
'Forgiveness':'After a disagreement, talk about what could help repair the relationship and move forward.',
'Gratitude':'Share one specific thing you appreciated about each other at the end of the day.',
'Honesty':'Notice and thank them when they tell the truth or take responsibility for a mistake.',
'Hope':'Choose one small goal together and talk about the next helpful step when progress feels hard.',
'Humility':'Celebrate a success while naming the people, practice or support that helped make it happen.',
'Humour':'Share kind humour that helps everyone feel included, especially when a day has been difficult.',
'Open-mindedness':'Explore two different viewpoints about a family topic and ask what each one gets right.',
'Kindness':'Look for one practical way to make someone’s day easier at home or in the community.',
'Leadership':'Give them a small family responsibility that involves planning, listening and helping others contribute.',
'Love':'Create a regular moment to check in, listen closely and show someone they matter.',
'Love of Learning':'Let them choose something new to learn, then ask them to teach you one interesting thing.',
'Perseverance':'Break a tricky task into small steps and notice the effort they show, not just the result.',
'Perspective':'Ask what advice they would give a friend facing a similar problem.',
'Prudence':'Before a choice, talk through what might happen next and which option best fits their goal.',
'Self-regulation':'Practise a calming routine together, such as taking a breath, a pause or a short walk.',
'Social Intelligence':'After a social situation, wonder together how different people may have felt.',
'Spirituality':'Make time to reflect on what matters most to your family, beliefs, community or the natural world.',
'Teamwork':'Work together on a shared task and notice when each person contributes something useful.',
'Zest':'Choose an activity that brings positive energy, then notice how enthusiasm affects others.'
};
function atHomeExample(name){return homeExamples[name]||'Look for a small everyday moment to notice and practise this strength together.'}
const growthActions={
'Appreciation of Beauty':'Pause for one minute each day to notice and name something skilful, beautiful or thoughtful.',
'Bravery':'Choose one small, safe challenge and practise a respectful sentence before you try it.',
'Creativity':'Try two different ways to solve a small problem before choosing your favourite idea.',
'Curiosity':'Write down one “how” or “why” question and find one reliable way to explore it.',
'Fairness':'Before a group decision, ask yourself whose voice has not been heard yet.',
'Forgiveness':'When a conflict is repaired, practise one small way to move forward kindly.',
'Gratitude':'Name one specific person or moment you appreciate and tell them why.',
'Honesty':'Practise taking responsibility with the words, “I made a mistake, and I can help fix it.”',
'Hope':'Turn one worry into a small next step you can take this week.',
'Humility':'After a success, name one person, effort or piece of learning that helped you.',
'Humour':'Use humour that helps everyone feel included, and check whether others are laughing too.',
'Open-mindedness':'Listen to one different viewpoint and name one part of it that makes sense.',
'Kindness':'Plan one helpful action for someone without being asked.',
'Leadership':'Take responsibility for one small group task: listen, organise and make space for others.',
'Love':'Give someone your full attention for a few minutes and show that they matter.',
'Love of Learning':'Choose one skill to improve, practise it in small steps and notice progress.',
'Perseverance':'Break a difficult task into three small steps, then complete the first one.',
'Perspective':'Ask, “What else might be true?” before deciding what you think.',
'Prudence':'Pause before a choice and name one likely consequence of each option.',
'Self-regulation':'Use a calm-down plan: pause, breathe, name the feeling, then choose your next step.',
'Social Intelligence':'Notice one person’s body language or tone and check in kindly.',
'Spirituality':'Set aside a quiet moment to reflect on what matters most to you.',
'Teamwork':'In the next shared task, ask how you can make another person’s job easier.',
'Zest':'Bring positive energy to one activity and notice how it affects the people around you.'
};
function growthAction(name){return growthActions[name]||'Choose one small way to practise this strength this week.'}
function growthStrengths(scores){return sortedScores(scores).slice(-3).reverse()}
function growthCardsMarkup(scores,audience='student'){return growthStrengths(scores).map(([name,value],index)=>{const detail=window.LEADERSHIP_PROFILES?.strengthDetails?.[name]||{};const situation=detail.school||'Notice a small moment to use this strength in learning or relationships.';const context=audience==='family'?'<p><b>At home:</b> '+esc(atHomeExample(name))+'</p>':audience==='teacher'?'<p><b>In class:</b> '+esc(situation)+'</p><p><b>Teacher opportunity:</b> Give a small, supported chance to practise this strength and notice the effort.</p>':'<p><b>It may show up when:</b> '+esc(situation)+'</p>';return '<article class="growth-strength-card"><div class="growth-strength-head"><img src="/assets/strengths/'+esc(assetSlug(name))+'-v1.png" alt=""><div><span>GROWTH FOCUS '+String(index+1).padStart(2,'0')+' · '+value+' / 20</span><h3>'+esc(name)+'</h3></div></div><p><b>What it means:</b> '+esc(detail.meaning||info(name)[1])+'</p>'+context+'<p><b>Small next step:</b> '+esc(growthAction(name))+'</p></article>'}).join('')}
function growthReportMarkup(r,audience='student'){const title=audience==='family'?'FAMILY GUIDE · GROWTH':'YEAR 5 · GROWTH';const heading=audience==='family'?esc(r.student_name)+'’s strengths to practise together':audience==='teacher'?esc(r.student_name)+' — strengths to practise next':esc(r.student_name)+'’s strengths to practise next';const intro=audience==='family'?'These strengths stood out less often in today’s answers. That is not a weakness or a label — it is simply a helpful place to notice and practise together.':audience==='teacher'?'These strengths stood out less often in this student’s self-ratings today. Use them as gentle, supported practice opportunities, never as a deficit judgement.':'These strengths stood out less often in your answers today. That does not mean you are bad at them — they are simply good strengths to practise next.';return '<section class="printreport pdf-page growth-report-page '+audience+'-growth-report">'+profileHeader(title)+'<div class="report-wave"></div><p class="report-kicker">ROOM TO GROW</p><h2>'+heading+'</h2><p class="chart-intro">'+intro+'</p><div class="growth-strength-grid">'+growthCardsMarkup(r.scores,audience)+'</div><p class="report-footer">Every person has all 24 strengths. Strengths can change with practice, opportunities and time.</p></section>'}
function assetSlug(name){const aliases={'Open-mindedness':'judgment'};return aliases[name]||String(name).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}
function theme(i){const p=palette[i%palette.length];return '--card-bg:'+p[0]+';--card-fg:'+p[1]}
function dataObject(value){if(typeof value==='string'){try{return JSON.parse(value)}catch(e){return {}}}return value&&typeof value==='object'?value:{}}
function dataList(value){if(Array.isArray(value))return value;if(typeof value==='string'){try{return JSON.parse(value)}catch(e){return []}}return []}
function sortedScores(scores){return Object.entries(dataObject(scores)).sort((a,b)=>Number(b[1])-Number(a[1])||a[0].localeCompare(b[0]))}
function leadershipProfile(scores){return window.LEADERSHIP_PROFILES?.createLeadershipProfile(dataObject(scores))||null}
function strengthExplainerContent(name,action){const detail=window.LEADERSHIP_PROFILES?.strengthDetails?.[name];if(!detail)return '<p><b>As a school leader:</b> '+esc(action)+'</p>';return '<p><b>What it means:</b> '+esc(detail.meaning)+'</p><p><b>In class:</b> '+esc(detail.school)+'</p><p><b>As a school leader:</b> '+esc(action)+'</p>'}
function strengthExplainerMarkup(name,action){return '<details class="strength-explainer"><summary>Explore this strength</summary>'+strengthExplainerContent(name,action)+'</details>'}
function leadershipStyleMarkup(styles){return '<div class="leadership-style-tags">'+(styles||[]).map(style=>'<details><summary>'+esc(style)+'</summary><p>'+esc(window.LEADERSHIP_PROFILES?.leadershipStyleDetails?.[style]||'A leadership style that can keep growing with practice.')+'</p></details>').join('')+'</div>'}
function leadershipStudentMarkup(profile){if(!profile)return '';const contributions=(profile.classroomContributions||[]).map(item=>'<li><b>'+esc(item.strength)+'</b>: '+esc(item.contribution)+'</li>').join('');return '<div class="leadership-profile-head"><span class="leadership-icon">'+esc(profile.icon)+'</span><div><span class="eyebrow">YOUR LEADERSHIP STORY</span><h2>'+esc(profile.title)+'</h2><p>'+esc(profile.summary)+'</p>'+leadershipStyleMarkup(profile.styles)+'</div></div><div class="leadership-profile-grid"><div><h3>How you may lead</h3><p>'+esc(profile.studentStory)+'</p><p>'+esc(profile.studentLead)+'</p><h3>What this may look like in class</h3><ul class="leadership-contributions">'+contributions+'</ul></div><div class="leadership-action"><span class="eyebrow">TRY THIS IN YEAR 6</span><p>'+esc(profile.studentAction)+'</p></div></div><p class="profile-note">This is a strengths reflection based on your answers today—not a label. You can grow every strength with practice.</p>'}
function leadershipTeacherMarkup(profile){if(!profile)return '';return '<section class="teacher-conversation leadership-teacher"><p class="report-kicker">LEADERSHIP PATTERN</p><h3>'+esc(profile.title)+'</h3><p><b>Supporting styles</b><span>'+esc((profile.supporting||[]).join(' · ')||'A strengths blend that will keep developing with practice')+'</span></p><p><b>Likely contribution</b><span>'+esc(profile.teacherContribution)+'</span></p><p><b>Useful opportunity</b><span>'+esc(profile.teacherOpportunity)+'</span></p><p><b>Conversation prompt</b><span>'+esc(profile.teacherPrompt)+'</span></p></section>'}
function recordedResponsesMarkup(record){const responses=dataList(record.responses);if(!responses.length)return '<p class="muted">No recorded responses are available for this profile.</p>';return '<details class="recorded-responses"><summary>View all '+responses.length+' recorded responses</summary><p>Private student self-ratings, shown for a teaching conversation.</p><ol>'+Q.map((question,index)=>'<li><span><b>'+(index+1)+'.</b> '+esc(question)+'</span><strong>'+esc(ratingLabels[Number(responses[index])-1]||'Not answered')+'</strong></li>').join('')+'</ol></details>'}
function jumpTop(){window.scrollTo({top:0,behavior:'smooth'})}
function showTab(t){$('student').hidden=t!=='student';$('teacher').hidden=t!=='teacher';const teacherTab=$('teacherTab');if(teacherTab){teacherTab.hidden=t==='teacher';teacherTab.classList.toggle('active',t==='teacher')}if(t==='teacher')loadTeacher();jumpTop()}
document.addEventListener('DOMContentLoaded',()=>{if(new URLSearchParams(location.search).get('teacher')==='1')showTab('teacher')})
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
function renderPage(){const n=page;const answered=answers.filter(x=>x!==null).length;const current=answers[n];$('stageLabel').textContent='YOUR DISCOVERY JOURNEY';$('counter').textContent=String(n+1).padStart(2,'0')+' / 96';$('progressFill').style.width=(answered/96*100)+'%';$('progress').setAttribute('aria-valuenow',answered);$('progressPercent').textContent=Math.round(answered/96*100)+'% complete';$('milestoneLabel').textContent=answered>=72?'Almost there — keep going!':answered>=48?'You’re more than halfway through!':answered>=24?'Your strengths picture is taking shape.':'Every answer helps tell your story.';$('questionList').innerHTML='<article class="question-card"><aside class="question-journey-panel" aria-hidden="true"><img class="journey-art" src="/assets/journeys/'+['discover','notice','connect','practise','reflect'][Math.floor(n/20)%5]+'-v1.png" alt="" loading="lazy"><span>PAUSE · NOTICE · REFLECT</span></aside><div class="eyebrow">✧ DISCOVERING YOU</div><p class="question-number">STATEMENT '+(n+1)+'</p><h2 class="question-title">'+esc(Q[n])+'</h2><div class="rating-caption"><span>Not like me</span><span>Very much like me</span></div><div class="choices" role="group" aria-label="Choose how much this describes you">'+ratingLabels.map((label,k)=>'<button type="button" class="choice '+(current===k+1?'selected':'')+'" aria-pressed="'+(current===k+1)+'" data-v="'+(k+1)+'"><strong>'+(k+1)+'</strong><span>'+esc(label)+'</span></button>').join('')+'</div></article>';$('questionList').querySelectorAll('[data-v]').forEach(b=>b.addEventListener('click',()=>{answerQuestion(n,Number(b.dataset.v));return;answers[n]=Number(b.dataset.v);scheduleProgressSave();$('questionList').querySelectorAll('[data-v]').forEach(c=>{const selected=Number(c.dataset.v)===answers[n];c.classList.toggle('selected',selected);c.setAttribute('aria-pressed',selected)});$('nextBtn').disabled=false;const count=answers.filter(x=>x!==null).length;$('progressFill').style.width=(count/96*100)+'%';$('progress').setAttribute('aria-valuenow',count);$('progressPercent').textContent=Math.round(count/96*100)+'% complete'}));$('nextBtn').disabled=current===null||submitting;$('nextBtn').innerHTML=n===95?'Reveal my strengths <span>✦</span>':'Continue <span>→</span>';$('quizError').textContent=''}
function answerQuestion(n,value){if(submitting||n!==page)return;answers[n]=value;scheduleProgressSave();if(page<95){page++;renderPage();jumpTop()}else{renderPage()}}
document.addEventListener('keydown',event=>{const tag=document.activeElement?.tagName;if(event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey||tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||$('quiz').hidden||submitted||submitting)return;const value=Number(event.key);if(Number.isInteger(value)&&value>=1&&value<=5){event.preventDefault();answerQuestion(page,value)}})
function prev(){if(page>0&&!submitting){page--;renderPage();jumpTop()}}
async function next(){if(submitting)return;if(answers[page]===null){$('quizError').textContent='Choose a response to continue.';return}if(page<95){page++;renderPage();jumpTop();return}if(answers.some(a=>a===null)){page=answers.findIndex(x=>x===null);renderPage();jumpTop();return}submitting=true;$('nextBtn').disabled=true;$('nextBtn').textContent='Saving your answers…';try{const r=await fetch('/api/submit',{method:'POST',headers:{'Content-Type':'application/json','X-Strengths-Resume':resumeToken||''},body:JSON.stringify({name:student,className:clazz,responses:answers})});const d=await r.json();if(!r.ok)throw Error(d.error||'Unable to save');
submitted=true;studentScores=d.scores;$('quiz').hidden=true;$('result').hidden=false;renderResults(d.scores);jumpTop()}catch(e){$('quizError').textContent='Your answers were not saved. Please try again. '+e.message;submitting=false;renderPage();$('quizError').textContent='Your answers were not saved. Please try again.'}}
function renderResults(scores){const top=sortedScores(scores);$('resultIntro').textContent=student+', these are the strengths that stood out most in your answers. They are all part of your unique story.';$('topResults').innerHTML=top.slice(0,5).map(([name,value],i)=>{const [icon,desc,action]=info(name);return '<article class="strength-card" style="'+theme(i)+'"><img class="strength-art" src="/assets/strengths/'+assetSlug(name)+'-v1.png" alt="" loading="lazy"><div class="symbol">'+icon+'</div><span class="rank">STRENGTH '+String(i+1).padStart(2,'0')+'</span><h3>'+esc(name)+'</h3><p>'+esc(desc)+'</p><span class="score-pill">'+value+' / 20</span>'+strengthExplainerMarkup(name,action)+'</article>'}).join('');const profile=leadershipProfile(scores);$('leadershipProfile').innerHTML=leadershipStudentMarkup(profile);$('allResults').innerHTML=top.map(([name,value],i)=>'<details class="strength-row strength-row-detail" style="'+theme(i)+'"><summary><img class="strength-row-art" src="/assets/strengths/'+assetSlug(name)+'-v1.png" alt=""><div><b>'+esc(name)+'</b><div class="strength-meter"><div style="width:'+(value/20*100)+'%"></div></div></div><small>'+value+' / 20</small></summary><div class="strength-row-more">'+strengthExplainerContent(name,info(name)[2])+'</div></details>').join('');$('growthResults').innerHTML='<div class="section-heading"><div><span class="eyebrow">ROOM TO GROW</span><h2>Strengths to practise next</h2><p>These strengths stood out less often in your answers today. They are not weaknesses — they are places to practise, learn and grow.</p></div></div><div class="growth-strength-grid">'+growthCardsMarkup(scores,'student')+'</div><p class="growth-note">Everyone has all 24 strengths. You can grow any strength with practice, support and time.</p>';renderPractice(scores)}
async function teacherLogin(){const input=$('teacherPassword'),password=input.value;if(!password){$('teacherMessage').textContent='Enter the teacher password, then try again.';input.focus();return}$('teacherMessage').textContent='Checking password…';try{const r=await fetch('/api/teacher-login',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});const d=await r.json();if(!r.ok){$('teacherMessage').textContent=d.error||'Sign in failed. Please check the password and try again.';input.focus();return}input.value='';$('teacherMessage').textContent='';await loadTeacher()}catch(e){$('teacherMessage').textContent='Could not contact the teacher sign-in service. Please refresh the page and try again.'}}
async function teacherLogout(){try{await fetch('/api/teacher-logout',{method:'POST'})}catch(e){}results=[];viewRows=[];$('teacherData').hidden=true;$('teacherGate').hidden=false;$('teacherMessage').textContent='';$('printArea').innerHTML='';}
async function loadTeacher(){try{const r=await fetch('/api/teacher',{credentials:'same-origin',cache:'no-store'});if(!r.ok){results=[];viewRows=[];$('teacherGate').hidden=false;$('teacherData').hidden=true;$('teacherMessage').textContent=r.status===401?'Enter your teacher password to view the dashboard.':'Unable to load teacher records ('+r.status+'). Please try Refresh.';return false}const data=await r.json();results=Array.isArray(data.submissions)?data.submissions:[];$('teacherGate').hidden=true;$('teacherData').hidden=false;$('total').textContent=results.length;$('classes').textContent=new Set(results.map(r=>r.class_name)).size;const availableClasses=[...new Set(results.map(x=>x.class_name).filter(Boolean))].sort();if(!selectedTeacherClasses.size)availableClasses.forEach(name=>selectedTeacherClasses.add(name));$('classFilter').innerHTML=availableClasses.map(name=>'<label><input type="checkbox" value="'+esc(name)+'" '+(selectedTeacherClasses.has(name)?'checked':'')+'> '+esc(name)+'</label>').join('')||'<span class="muted">No submitted classes yet.</span>';$('classFilter').querySelectorAll('input').forEach(input=>input.addEventListener('change',()=>{input.checked?selectedTeacherClasses.add(input.value):selectedTeacherClasses.delete(input.value);renderTeacher()}));try{renderTeacher()}catch(e){console.error('Teacher dashboard renderer failed',e);viewRows=results.slice();$('filteredCount').textContent='Showing '+results.length+' saved profiles';$('cohortChart').innerHTML='<p class="muted">Cohort charts are temporarily unavailable. Student profiles remain available below.</p>';$('virtueChart').innerHTML='';$('commonStrength').textContent='—';$('submissionList').innerHTML=results.map(r=>'<article class="submission"><div class="avatar">'+esc(r.student_name?.[0]?.toUpperCase()||'S')+'</div><div><b>'+esc(r.student_name||'Student')+' <span class="muted">· '+esc(r.class_name||'')+'</span></b><p>Saved strengths profile</p></div><div class="student-record-actions"><a class="secondary" href="/student-profile.html?student='+encodeURIComponent(r.id)+'">View results</a><button class="secondary" data-report="'+esc(r.id)+'">View PDF ↗</button></div></article>').join('')||'<p class="muted">No student profiles have been submitted yet.</p>';$('submissionList').querySelectorAll('[data-report]').forEach(b=>b.addEventListener('click',()=>printReports(b.dataset.report)))}return true}catch(e){console.error('Teacher dashboard request failed',e);results=[];viewRows=[];$('teacherGate').hidden=false;$('teacherData').hidden=true;$('teacherMessage').textContent='The teacher dashboard could not load. Please refresh the page and try again.';return false}}
function renderTeacher(){const search=$('search').value.toLowerCase();viewRows=results.filter(r=>(!selectedTeacherClasses.size||selectedTeacherClasses.has(r.class_name))&&r.student_name.toLowerCase().includes(search));$('filteredCount').textContent='Showing '+viewRows.length+' of '+results.length+' saved profiles';const counts={};viewRows.forEach(r=>sortedScores(r.scores).slice(0,5).forEach(([name])=>counts[name]=(counts[name]||0)+1));const top=Object.entries(counts).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));$('commonStrength').textContent=top[0]?.[0]||'—';const max=top[0]?.[1]||1;$('cohortChart').innerHTML=top.length?top.slice(0,7).map(([name,n])=>'<div class="bar-row"><span class="bar-label" title="'+esc(name)+'">'+esc(name)+'</span><div class="bar-track"><div class="bar-fill" style="width:'+(n/max*100)+'%"></div></div><span class="bar-value">'+n+'</span></div>').join(''):'<p class="muted">When students submit their responses, you’ll see the most common top strengths here.</p>';$('submissionList').innerHTML=viewRows.length?viewRows.map(r=>{const top=sortedScores(r.scores)[0];return '<article class="submission"><div class="avatar">'+esc(r.student_name[0]?.toUpperCase()||'S')+'</div><div><b>'+esc(r.student_name)+' <span class="muted">· '+esc(r.class_name)+'</span></b><p>'+new Date(r.created_at).toLocaleString('en-AU')+' · Leading strength: '+esc(top?.[0]||'')+'</p></div><div class="student-record-actions"><a class="secondary" href="/student-profile.html?student='+encodeURIComponent(r.id)+'">View results</a><button class="secondary" data-report="'+esc(r.id)+'">View PDF ↗</button></div>'+recordedResponsesMarkup(r)+((r.selected_reflections||[]).length?'<details class="teacher-reflections"><summary>Leadership journal · '+r.selected_reflections.length+' saved reflection(s)</summary>'+r.selected_reflections.map(reflectionRecordMarkup).join('')+'</details>':'')+'</article>'}).join(''):'<div class="note-card"><span>✦</span><p>No students match these filters yet.</p></div>';$('submissionList').querySelectorAll('[data-report]').forEach(b=>b.addEventListener('click',()=>printReports(b.dataset.report)));renderVirtueChart(viewRows)}
const challengeLibrary=[
 {id:'invite-every-voice',title:'Invite every voice',artwork:'include-everyone-v1',strengths:['Teamwork','Fairness','Social Intelligence'],action:'In your next group task, invite someone who has not spoken to share their ideas, without putting them on the spot.',prompt:'How did making space for another idea change the group?',service:'Respect every person’s dignity by making sure their voice matters.',year6:'In your class, school or future leadership role, help others feel heard and included.'},
 {id:'choose-kind-response',title:'Choose the kind response',artwork:'welcome-new-student-v1',strengths:['Kindness','Love','Forgiveness'],action:'Notice someone who needs encouragement and offer a specific, genuine act of kindness.',prompt:'What did you notice about the other person’s reaction?',service:'Follow St Bernadette’s example of kindness through action, not just words.',year6:'Welcome new or younger students and help them feel they belong, now and as your leadership grows.'},
 {id:'ask-better-question',title:'Ask a better question',artwork:'listen-first-v1',strengths:['Curiosity','Love of Learning','Perspective'],action:'Ask one thoughtful question that helps your class understand a problem or idea more deeply.',prompt:'What did your question help people discover?'},
 {id:'keep-going-together',title:'Keep going together',artwork:'keep-going-v1',strengths:['Perseverance','Zest','Hope'],action:'When a task feels hard, name one small next step and encourage a teammate to take it with you.',prompt:'What helped you and your team keep going?'},
 {id:'lead-with-care',title:'Lead with care',artwork:'help-the-team-v1',strengths:['Leadership','Humility','Honesty'],action:'Help organise a group task, share responsibilities fairly and listen before making decisions.',prompt:'How did you balance leading and listening?',service:'Practise humble leadership: put the needs of your group before recognition.',year6:'Take responsibility while helping others contribute, in any year or leadership role.'},
 {id:'pause-before-deciding',title:'Pause before deciding',artwork:'care-for-place-v1',strengths:['Prudence','Self-regulation','Open-mindedness'],action:'Before a tricky choice, pause and think of two possible outcomes and one other point of view.',prompt:'How did pausing change your choice?'},
 {id:'stand-up-for-right',title:'Stand up for what is right',artwork:'speak-up-kindly-v1',strengths:['Bravery','Fairness','Honesty'],action:'Practise a respectful sentence you could use when someone is left out or treated unfairly.',prompt:'What words helped you be brave and respectful?'},
 {id:'notice-good',title:'Notice the good',artwork:'notice-gratitude-v1',strengths:['Gratitude','Appreciation of Beauty','Humour'],action:'Share one specific thing that made your class, team or day better, and thank someone involved.',prompt:'How did noticing the good affect the people around you?'}
];
function renderPractice(scores){
 const ranked=sortedScores(scores),topNames=ranked.slice(0,5).map(item=>item[0]);
 const select=$('reflectionStrength');
 if(select)select.innerHTML='<option value="">Choose a strength…</option>'+ranked.map(([name])=>'<option value="'+esc(name)+'">'+esc(name)+'</option>').join('');
 const recommended=challengeLibrary.filter(challenge=>challenge.strengths.some(strength=>topNames.includes(strength))).slice(0,3);
 const cards=(recommended.length?recommended:challengeLibrary.slice(0,3));
 $('leadershipChallenges').innerHTML=cards.map((challenge,index)=>'<article class="challenge-card"><img class="challenge-art" src="/assets/challenges/'+challenge.artwork+'.png" alt="" loading="lazy"><span class="challenge-number">CHALLENGE '+String(index+1).padStart(2,'0')+'</span><h3>'+esc(challenge.title)+'</h3><div class="challenge-tags">'+challenge.strengths.map(strength=>'<span>'+esc(strength)+'</span>').join('')+'</div><p>'+esc(challenge.action)+'</p><p class="challenge-prompt"><b>Reflect:</b> '+esc(challenge.prompt)+'</p><p class="challenge-service"><b>Serve with heart:</b> '+esc(challenge.service||'Put kindness, fairness and respect for every person into action.')+'</p><p class="challenge-year6"><b>Growing as a leader:</b> '+esc(challenge.year6||'Keep practising this strength to set a positive example and support others at school.')+'</p><button type="button" class="challenge-reflect-button" data-challenge="'+esc(challenge.id)+'">Reflect on this challenge →</button></article>').join('');
 if(select)select.innerHTML='<option value="">Choose a strength…</option>'+ranked.map(([name])=>'<option value="'+esc(name)+'">'+esc(name)+'</option>').join('');
 $('leadershipChallenges').querySelectorAll('[data-challenge]').forEach(button=>button.addEventListener('click',()=>{const challenge=challengeLibrary.find(item=>item.id===button.dataset.challenge);if(!challenge)return;const preferred=challenge.strengths.find(name=>topNames.includes(name))||challenge.strengths[0];if(select)select.value=preferred;const how=$('reflectionHow');if(how&&!how.value)how.placeholder='For '+challenge.title+', I used this strength when…';$('reflect').scrollIntoView({behavior:'smooth',block:'start'});if(select)select.focus({preventScroll:true})}));
 loadReflections();
}
async function loadReflections(){
 if(!resumeToken){$('reflectionList').innerHTML='';return}
 try{
   const response=await fetch('/api/reflections',{headers:{'X-Strengths-Resume':resumeToken}});
   const data=await response.json();
   if(!response.ok){$('reflectionList').innerHTML='';return}
   $('reflectionList').innerHTML=(data.reflections||[]).map(reflection=>'<article class="saved-reflection"><span class="eyebrow">'+esc(reflection.strength_id)+' · SAVED REFLECTION'+'</span><p><b>I used it:</b> '+esc(reflection.how_used)+'</p><p><b>I learned:</b> '+esc(reflection.learned)+'</p><p><b>Next goal:</b> '+esc(reflection.future_goal)+'</p></article>').join('')||'<p class="muted">Your saved reflections will appear here.</p>';
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
     selectedForReport:true
   })});
   const data=await response.json();
   if(!response.ok)throw Error(data.error||'Unable to save your reflection.');
   ['reflectionHow','reflectionWhat','reflectionImpact','reflectionLearned','reflectionGoal'].forEach(id=>$(id).value='');
   $('reflectionStrength').value='';message.textContent='Your reflection is saved.';
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
 target.innerHTML=values.map(([virtue,value])=>'<div class="virtue-row"><img src="/assets/virtues/'+virtue.toLowerCase().replace(/[^a-z]+/g,'-').replace('wisdom','wisdom-knowledge')+'-v1.png" alt="" loading="lazy"><span>'+esc(virtue)+'</span><div><i style="width:'+Math.round(value/20*100)+'%"></i></div><b>'+value.toFixed(1)+'</b></div>').join('');
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
function reflectionRecordMarkup(reflection){return '<article class="saved-reflection"><h3>'+esc(reflection.strength_id||'Strength')+'</h3><p><b>How I used it:</b> '+esc(reflection.how_used||'')+'</p><p><b>What happened:</b> '+esc(reflection.what_happened||'')+'</p><p><b>Impact on others:</b> '+esc(reflection.impact_on_others||'')+'</p><p><b>What I learned:</b> '+esc(reflection.learned||'')+'</p><p><b>My next goal:</b> '+esc(reflection.future_goal||'')+'</p></article>'}
function reflectionReportPages(r){return (r.selected_reflections||[]).map((reflection,index)=>'<section class="printreport pdf-page reflection-report-page">'+profileHeader('LEAD WITH HEART · REFLECTION '+(index+1))+'<div class="report-wave"></div><p class="report-kicker">MY LEADERSHIP JOURNAL</p><h2>'+esc(r.student_name||'Student')+' — saved reflection</h2>'+reflectionRecordMarkup(reflection)+'<p class="report-footer">Private student reflection · Available to the student and authorised teachers.</p></section>').join('')}
function profileHeader(title){return '<header class="report-brand"><img class="report-logo" src="/assets/brand/stbernadettes-horizontal-primary.png" alt="St Bernadette’s Catholic Primary School"><span>THE BERNADETTE WAY · '+title+'</span></header>'}
function studentReportMarkup(r){const sorted=sortedScores(r.scores),lead=sorted[0]||['Leadership',0],profile=leadershipProfile(r.scores),topFive=sorted.slice(0,5),detailRows=topFive.map(([name,value],index)=>{const detail=window.LEADERSHIP_PROFILES?.strengthDetails?.[name]||{};return '<article class="student-strength-detail"><div class="student-strength-detail-head"><img src="/assets/strengths/'+esc(assetSlug(name))+'-v1.png" alt=""><div><span>STRENGTH '+String(index+1).padStart(2,'0')+' · '+value+' / 20</span><h3>'+esc(name)+'</h3></div></div><p><b>What it means:</b> '+esc(detail.meaning||info(name)[1])+'</p><p><b>In class:</b> '+esc(detail.school||'Look for a chance to use this strength in learning and relationships.')+'</p><p><b>At home:</b> '+esc(atHomeExample(name))+'</p><p><b>As a school leader:</b> '+esc(info(name)[2])+'</p></article>'}).join('');return '<section class="printreport pdf-page student-profile-report">'+profileHeader('YEAR 5')+'<div class="report-wave"></div><div class="student-report-hero"><div><p class="report-kicker">LEAD WITH HEART</p><h2>'+esc(r.student_name)+'’s strengths profile</h2><p>Class: '+esc(r.class_name)+'</p><p class="student-report-note">A picture of today — not a label. Every strength has room to grow.</p></div><img src="/assets/strengths/'+esc(assetSlug(lead[0]))+'-v1.png" alt=""></div><h3>My top five strengths</h3><div class="profile-top-five">'+topFive.map(([name,value],i)=>'<article><img src="/assets/strengths/'+esc(assetSlug(name))+'-v1.png" alt=""><span>STRENGTH 0'+(i+1)+'</span><b>'+esc(name)+'</b><strong>'+value+' / 20</strong><p>'+esc(info(name)[2])+'</p></article>').join('')+'</div><section class="report-leadership"><p class="report-kicker">MY LEADERSHIP STORY</p><h3>'+esc(profile?.title||'My strengths in action')+'</h3><p>'+esc(profile?.studentStory||'')+'</p><p><b>Try this in Year 6:</b> '+esc(profile?.studentAction||'')+'</p></section><h3>My whole strengths picture</h3><p class="chart-intro">Each bar shows how often this strength stood out in my answers today.</p><div class="profile-score-chart">'+sorted.map(([name,value],i)=>'<div><span>'+esc(info(name)[0])+'</span><b>'+esc(name)+'</b><i><em style="width:'+Math.round(value/20*100)+'%;background:'+palette[i%palette.length][1]+'"></em></i><strong>'+value+' / 20</strong></div>').join('')+'</div><p class="report-footer">Private learning reflection · For reflection and discussion only. These self-report results are not a diagnosis or a fixed measure of ability.</p></section><section class="printreport pdf-page student-strengths-detail-page">'+profileHeader('YEAR 5 · TOP STRENGTHS')+'<div class="report-wave"></div><p class="report-kicker">A CLOSER LOOK</p><h2>'+esc(r.student_name)+'’s strengths in action</h2><p class="chart-intro">Here are some ways your top strengths might show up at school, at home and in leadership.</p><div class="student-strength-details">'+detailRows+'</div><section class="student-detail-action"><p class="report-kicker">YOUR YEAR 6 IDEA</p><p>'+esc(profile?.studentAction||'Choose one strength to practise in your next group activity.')+'</p></section><p class="report-footer">This is a strengths reflection based on your answers today — not a label. You can grow every strength with practice.</p></section>'+growthReportMarkup(r,'student')+reflectionReportPages(r)}
function familyReportMarkup(r){const sorted=sortedScores(r.scores),lead=sorted[0]||['Leadership',0],profile=leadershipProfile(r.scores),topFive=sorted.slice(0,5),detailRows=topFive.map(([name,value],index)=>{const detail=window.LEADERSHIP_PROFILES?.strengthDetails?.[name]||{};return '<article class="family-strength-detail"><div class="family-strength-detail-head"><img src="/assets/strengths/'+esc(assetSlug(name))+'-v1.png" alt=""><div><span>STRENGTH '+String(index+1).padStart(2,'0')+' · '+value+' / 20</span><h3>'+esc(name)+'</h3></div></div><p><b>What it means:</b> '+esc(detail.meaning||info(name)[1])+'</p><p><b>In class:</b> '+esc(detail.school||'Look for a chance to use this strength in learning and relationships.')+'</p><p><b>At home:</b> '+esc(atHomeExample(name))+'</p><p><b>As a school leader:</b> '+esc(info(name)[2])+'</p></article>'}).join('');return '<section class="printreport pdf-page family-profile-report">'+profileHeader('FAMILY GUIDE · YEAR 5')+'<div class="report-wave"></div><div class="student-report-hero"><div><p class="report-kicker">A STRENGTHS CONVERSATION AT HOME</p><h2>'+esc(r.student_name)+'’s strengths story</h2><p>Class: '+esc(r.class_name)+'</p><p class="student-report-note">This is a reflection on answers given today. It is not a label, diagnosis or prediction.</p></div><img src="/assets/strengths/'+esc(assetSlug(lead[0]))+'-v1.png" alt=""></div><section class="family-leadership"><p class="report-kicker">LEADERSHIP PATTERN</p><h3>'+esc(profile?.title||'Strengths in action')+'</h3><p>'+esc(profile?.familyStory||'')+'</p><h3>How you can support this at home</h3><p>'+esc(profile?.familyAction||'')+'</p></section><h3>Strengths that stood out today</h3><div class="profile-top-five">'+topFive.map(([name,value],i)=>'<article><img src="/assets/strengths/'+esc(assetSlug(name))+'-v1.png" alt=""><span>STRENGTH 0'+(i+1)+'</span><b>'+esc(name)+'</b><strong>'+value+' / 20</strong><p>'+esc(info(name)[1])+'</p></article>').join('')+'</div><section class="family-leadership family-conversation"><h3>A good conversation starter</h3><p>“Which of these strengths feels most like you right now? Can you tell me about a time you used it?”</p><p>“What is one small way you could use it as a Year 6 leader?”</p></section><p class="report-footer">Private family reflection · Every strength can grow with practice.</p></section><section class="printreport pdf-page family-strengths-detail-page">'+profileHeader('FAMILY GUIDE · TOP STRENGTHS')+'<div class="report-wave"></div><p class="report-kicker">A CLOSER LOOK</p><h2>'+esc(r.student_name)+'’s top strengths in action</h2><p class="chart-intro">These examples can help your family notice, name and practise strengths together.</p><div class="family-strength-details">'+detailRows+'</div><p class="report-footer">Private family reflection · Every strength can grow with practice.</p></section>'+growthReportMarkup(r,'family')+reflectionReportPages(r)}
function teacherDetailReportMarkup(r){const sorted=sortedScores(r.scores).slice(0,5),profile=leadershipProfile(r.scores),rows=sorted.map(([name,value],index)=>{const detail=window.LEADERSHIP_PROFILES?.strengthDetails?.[name]||{};return '<article class="teacher-strength-detail"><div class="teacher-strength-detail-head"><span>'+String(index+1).padStart(2,'0')+'</span><img src="/assets/strengths/'+esc(assetSlug(name))+'-v1.png" alt=""><div><p>STRENGTH '+String(index+1).padStart(2,'0')+' · '+value+' / 20</p><h3>'+esc(name)+'</h3></div></div><p><b>What it means</b><span>'+esc(detail.meaning||info(name)[1])+'</span></p><p><b>In class</b><span>'+esc(detail.school||'Look for opportunities to use this strength in learning and relationships.')+'</span></p><p><b>Leadership opportunity</b><span>'+esc(info(name)[2])+'</span></p></article>'}).join('');return '<section class="printreport pdf-page teacher-detail-page">'+profileHeader('YEAR 5 · TEACHER DETAILS')+'<div class="report-wave"></div><p class="report-kicker">STRENGTHS IN PRACTICE</p><h2>'+esc(r.student_name)+' — classroom applications</h2><p class="chart-intro">Use these self-reported strengths as private conversation starters. Pair them with your own classroom observations.</p><section class="teacher-focus-callout"><b>Leadership focus: '+esc(profile?.title||'Strengths in action')+'</b><span>'+esc(profile?.teacherPrompt||'Where have you noticed this student using a strength to support others?')+'</span></section><div class="teacher-strength-details">'+rows+'</div><p class="report-footer">Private teaching conversation · For reflection and planning, never as a fixed label.</p></section>'}
function reportMarkup(r,full=true){const sorted=sortedScores(r.scores),hero=assetSlug(sorted[0]?.[0]||'leadership'),responses=dataList(r.responses),topFive=sorted.slice(0,5),profile=leadershipProfile(r.scores),summary='<section class="printreport pdf-page teacher-summary">'+profileHeader('YEAR 5 · TEACHER REPORT')+'<div class="report-wave"></div><div class="teacher-report-hero"><div><p class="report-kicker">LEAD WITH HEART</p><h2>'+esc(r.student_name)+' — strengths profile</h2><p>Class: '+esc(r.class_name)+(r.created_at?' · '+new Date(r.created_at).toLocaleDateString('en-AU'):'')+'</p><p class="student-report-note">Use as a private teaching conversation starter, never as a fixed judgement.</p></div><img src="/assets/strengths/'+esc(hero)+'-v1.png" alt=""></div><h3>Signature strengths</h3><div class="teacher-top-five">'+topFive.map(([name,value],i)=>'<article><img src="/assets/strengths/'+esc(assetSlug(name))+'-v1.png" alt=""><span>0'+(i+1)+'</span><b>'+esc(name)+'</b><strong>'+value+' / 20</strong><p>'+esc(info(name)[2])+'</p></article>').join('')+'</div>'+leadershipTeacherMarkup(profile)+'<section class="teacher-conversation"><p class="report-kicker">TEACHING CONVERSATION</p><h3>Strengths in action</h3>'+topFive.map(([name])=>'<p><b>'+esc(name)+'</b><span>'+esc(info(name)[2])+'</span></p>').join('')+'</section><p class="report-footer">Private teaching conversation · Use for reflection and discussion, never as a label.</p></section>',chart='<section class="printreport pdf-page teacher-chart-page">'+profileHeader('YEAR 5 · WHOLE PROFILE')+'<div class="report-wave"></div><p class="report-kicker">THE WHOLE PICTURE</p><h2>'+esc(r.student_name)+'’s 24 character strengths</h2><p class="chart-intro">Scores reflect this student’s self-ratings today. Each strength is shown out of 20.</p><div class="teacher-score-chart">'+sorted.map(([name,value],i)=>'<div><span>'+esc(info(name)[0])+'</span><b>'+esc(name)+'</b><i><em style="width:'+Math.round(value/20*100)+'%;background:'+palette[i%palette.length][1]+'"></em></i><strong>'+value+' / 20</strong></div>').join('')+'</div><p class="report-footer">Private teaching conversation · For reflection and discussion only.</p></section>',appendix=full?[0,32,64].map((start,page)=>'<section class="printreport pdf-page response-page">'+profileHeader('YEAR 5 · RESPONSE APPENDIX')+'<div class="report-wave"></div><p class="report-kicker">PRIVATE TEACHER RECORD · PAGE '+(page+1)+' OF 3</p><h2>'+esc(r.student_name)+' — recorded responses</h2><p class="chart-intro">Questionnaire self-ratings, scale 1–5.</p><table class="printtable"><thead><tr><th>No.</th><th>Statement</th><th>Rating</th></tr></thead><tbody>'+Q.slice(start,start+32).map((q,i)=>'<tr><td>'+(start+i+1)+'</td><td>'+esc(q)+'</td><td>'+esc(ratingLabels[Number(responses[start+i])-1]||'Not answered')+'</td></tr>').join('')+'</tbody></table></section>').join(''):'';return summary+teacherDetailReportMarkup(r)+growthReportMarkup(r,'teacher')+chart+appendix+reflectionReportPages(r)}
function safariTextPdf(doc,pages,notify){
 // Safari's HTML canvas capture can return a blank bitmap; draw report content directly into jsPDF instead.
 const margin=17,maxWidth=176,bottom=278;
 const blockTags=new Set(['P','H1','H2','H3','H4','H5','H6','DIV','SECTION','ARTICLE','LI','TR','HEADER','FOOTER','BLOCKQUOTE']);
 let pageNo=0;
 for(const page of pages){
  if(pageNo++)doc.addPage();
  let y=19;
  const line=(value,size=9,bold=false,indent=0)=>{
   const content=String(value||'').replace(/\s+/g,' ').trim();if(!content)return;
   doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(24,48,75);
   const wrapped=doc.splitTextToSize(content,maxWidth-indent);
   for(const part of wrapped){if(y>bottom){doc.addPage();y=19}doc.text(part,margin+indent,y);y+=Math.max(4.3,size*.46)}
   y+=2;
  };
  doc.setFillColor(14,55,94);doc.rect(0,0,210,10,'F');
  line('THE BERNADETTE WAY  |  LEAD WITH HEART',11,true);
  const walk=(node,depth=0)=>{
   if(node.nodeType===3){const value=node.textContent.trim();if(value&&node.parentElement?.children.length===0)line(value,9,false,Math.min(depth,2)*2);return}
   if(node.nodeType!==1)return;
   const tag=node.tagName;
   if(['SCRIPT','STYLE','SVG','IMG','BUTTON'].includes(tag))return;
   if(tag==='H1'||tag==='H2'){line(node.textContent,14,true);return}
   if(tag==='H3'||tag==='H4'){line(node.textContent,11,true);return}
   if(tag==='P'||tag==='LI'||tag==='TD'||tag==='TH'){line(node.textContent,9,tag==='TH',tag==='LI'?4:0);return}
   if(tag==='TR'){const cells=[...node.children].filter(c=>['TD','TH'].includes(c.tagName));if(cells.length){line(cells.map(c=>c.textContent.trim()).join('  |  '),8);return}}
   if(tag==='B'||tag==='STRONG'){line(node.textContent,9,true);return}
   if(tag==='SPAN'&&node.children.length===0){if(node.parentElement?.tagName==='I')return;line(node.textContent,8);return}
   if(tag==='I'||tag==='EM')return;
   for(const child of node.childNodes)walk(child,depth+(blockTags.has(tag)?1:0));
  };
  for(const child of page.childNodes)walk(child);
  doc.setFontSize(8);doc.setTextColor(95,111,124);doc.text('Private student reflection  |  Discover · Grow · Shine',margin,290);
  notify('Building Safari-compatible PDF page '+pageNo+' of '+pages.length+'…');
 }
}
async function downloadPdf(markup,studentOnly=false,fileName='strengths-profile.pdf'){
 const area=$('printArea'),status=$('pdfDownloadStatus');
 const notify=message=>{if(status){status.hidden=false;status.textContent=message;}};
 notify('Preparing your PDF…');
 if(!area||!window.html2canvas||!window.jspdf?.jsPDF){notify('PDF tools could not load. Refresh this page and try again.');return}
 area.className='pdf-render '+(studentOnly?'student-print':'');area.innerHTML=markup;
 const timeout=(promise,ms,label)=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error(label+' timed out')),ms))]);
 try{
  const images=[...area.querySelectorAll('img')];
  await Promise.race([Promise.all(images.map(img=>img.decode?.().catch(()=>undefined)||Promise.resolve())),new Promise(resolve=>setTimeout(resolve,1800))]);
  const {jsPDF}=window.jspdf,doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true}),pages=[...area.querySelectorAll('.pdf-page')];
  if(!pages.length)throw Error('No PDF pages were rendered');
  if(isSafariPrint()){
   console.info('[PDF diagnostic] Using native jsPDF text layout to avoid Safari blank canvas capture',{pages:pages.length});
   safariTextPdf(doc,pages,notify);
  }else for(let index=0;index<pages.length;index++){
   notify('Rendering PDF page '+(index+1)+' of '+pages.length+'…');
   const page=pages[index],started=performance.now(),rect=page.getBoundingClientRect(),pageImages=[...page.querySelectorAll('img')];
   const diagnostics={page:index+1,dimensions:{width:Math.round(rect.width),height:Math.round(rect.height)},images:pageImages.map(img=>({loaded:img.complete&&img.naturalWidth>0,width:img.naturalWidth,height:img.naturalHeight})),safari:isSafariPrint()};
   console.info('[PDF diagnostic] Starting capture',diagnostics);
   let canvas;
   try{
    canvas=await timeout(window.html2canvas(page,{scale:isSafariPrint()?0.75:1,backgroundColor:'#ffffff',useCORS:true,logging:false,windowWidth:980,imageTimeout:5000,removeContainer:true,foreignObjectRendering:isSafariPrint()}),25000,'PDF page '+(index+1));
   }catch(captureError){
    console.error('[PDF diagnostic] Capture failed after '+Math.round(performance.now()-started)+'ms',diagnostics,captureError);
    if(isSafariPrint()&&index===0){
     notify('Safari is checking whether report images caused the timeout…');
     const imageElements=[...page.querySelectorAll('img')],previous=imageElements.map(img=>img.style.visibility);
     imageElements.forEach(img=>{img.style.visibility='hidden'});
     try{
      const retryStart=performance.now();
      canvas=await timeout(window.html2canvas(page,{scale:0.65,backgroundColor:'#ffffff',useCORS:false,logging:false,windowWidth:980,imageTimeout:1000,removeContainer:true}),12000,'Image-free PDF page '+(index+1));
      console.info('[PDF diagnostic] Image-free capture succeeded in '+Math.round(performance.now()-retryStart)+'ms');
      notify('Safari rendered page 1 without images; continuing export…');
     }catch(retryError){console.error('[PDF diagnostic] Image-free capture also failed',retryError);throw captureError}
     finally{imageElements.forEach((img,i)=>{img.style.visibility=previous[i]})}
    }else throw captureError;
   }
   console.info('[PDF diagnostic] Capture completed', {page:index+1,elapsedMs:Math.round(performance.now()-started),canvasWidth:canvas.width,canvasHeight:canvas.height});
   if(!canvas.width||!canvas.height)throw Error('PDF page could not be captured');
   if(index)doc.addPage();
   doc.addImage(canvas.toDataURL('image/jpeg',0.8),'JPEG',10,10,190,277,undefined,'FAST');
  }
  notify('Finalising your PDF…');
  const blob=await timeout(Promise.resolve().then(()=>doc.output('blob')),8000,'PDF creation'),url=URL.createObjectURL(blob);
  const anchor=document.createElement('a');anchor.href=url;anchor.download=fileName;anchor.textContent='Open or save '+fileName;anchor.className='secondary';anchor.style.display='inline-block';anchor.style.marginLeft='10px';
  if(status){status.replaceChildren(document.createTextNode('Your PDF is ready. '),anchor);status.hidden=false;}else document.body.appendChild(anchor);
  anchor.click();
  if(window.__lastYear5PdfUrl)URL.revokeObjectURL(window.__lastYear5PdfUrl);
  window.__lastYear5PdfUrl=url;
 }catch(error){
  console.error('PDF export failed',error);
  notify('PDF generation stopped: '+(error?.message||'Unknown error')+'. Please retry, or use the print option in your browser.');
 }finally{area.innerHTML='';area.className=''}
}
async function reflectionsForExport(){
 if(!resumeToken)return [];
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),4500);
 try{
  const response=await fetch('/api/reflections',{headers:{'X-Strengths-Resume':resumeToken},cache:'no-store',signal:controller.signal});
  if(!response.ok)throw Error('Reflection request returned '+response.status);
  const data=await response.json();
  return Array.isArray(data.reflections)?data.reflections:[];
 }catch(error){console.warn('Reflections unavailable for PDF export; continuing with strengths report',error);return []}
 finally{clearTimeout(timer)}
}
function isSafariPrint(){const ua=navigator.userAgent;return ua.includes('Safari/')&&!ua.includes('Chrome/')&&!ua.includes('CriOS/')&&!ua.includes('FxiOS/')&&!ua.includes('EdgiOS/')}
function startSafariReport(){return null}
function finishSafariReport(popup,markup,name){
 const area=$('printArea'),status=$('pdfDownloadStatus');
 if(!area){if(status){status.hidden=false;status.textContent='Printable report area is unavailable.'}return}
 area.className='student-print';area.innerHTML=markup;
 if(status){status.hidden=false;status.textContent='Safari print dialog opened in this tab. Choose PDF → Save as PDF; your student session stays open.'}
 const styleId='safari-inline-print-fix';let style=document.getElementById(styleId);
 if(!style){style=document.createElement('style');style.id=styleId;style.textContent='@media screen{body>#printArea{display:none!important}}@media print{body>#printArea:not(:empty){display:block!important;visibility:visible!important;position:static!important;width:100%!important;margin:0!important;padding:0!important}body>#printArea .printreport{display:block!important;visibility:visible!important}body>header,body>main,body>footer{display:none!important}}';document.head.appendChild(style)}
 requestAnimationFrame(()=>requestAnimationFrame(()=>window.print()));
}
async function printStudentResult(){if(!submitted||!studentScores){alert('Complete or reopen your strengths profile before downloading.');return}const reflections=await reflectionsForExport(),markup=studentReportMarkup({student_name:student,class_name:clazz,scores:studentScores,selected_reflections:reflections});await downloadPdf(markup,true,(student||'student')+'-strengths-profile.pdf')}
async function printFamilyResult(){if(!submitted||!studentScores){alert('Complete or reopen your strengths profile before downloading.');return}const reflections=await reflectionsForExport(),markup=familyReportMarkup({student_name:student,class_name:clazz,scores:studentScores,selected_reflections:reflections});await downloadPdf(markup,true,(student||'student')+'-family-guide.pdf')}
function printReports(id){const arr=id?results.filter(r=>String(r.id)===String(id)):viewRows;if(!arr.length){alert('No reports to export.');return}const label=arr.length===1?(arr[0].student_name||'student'):'year5-cohort';downloadPdf(arr.map(r=>reportMarkup(r,true)).join(''),false,label+'-teacher-report.pdf')}