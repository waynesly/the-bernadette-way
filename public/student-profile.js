const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const palette=[['#ece7ff','#7057bc'],['#ffe7e8','#c56683'],['#e3f7ed','#3b9a74'],['#fff0da','#c28c48'],['#e5efff','#628bce']];
const assetSlug=name=>({'Open-mindedness':'judgment'}[name]||String(name).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''));
const sortedScores=scores=>Object.entries(scores||{}).sort((a,b)=>Number(b[1])-Number(a[1])||a[0].localeCompare(b[0]));
const theme=index=>{const item=palette[index%palette.length];return '--card-bg:'+item[0]+';--card-fg:'+item[1]};
function strengthContent(name){
  const detail=window.LEADERSHIP_PROFILES?.strengthDetails?.[name];
  if(!detail)return '';
  return '<p><b>What it means:</b> '+esc(detail.meaning)+'</p><p><b>At school:</b> '+esc(detail.school)+'</p><p class="strength-reminder">Everyone has this strength in different amounts. It can grow with practice.</p>';
}
function render(student){
  const scores=student.scores||{}, ranked=sortedScores(scores), profile=window.LEADERSHIP_PROFILES.createLeadershipProfile(scores);
  $('profileLoading').hidden=true;
  const target=$('studentProfile'); target.hidden=false;
  target.innerHTML='<div class="teacher-heading"><div><span class="school-kicker">PRIVATE · TEACHER VIEW</span><span class="eyebrow">YEAR 5 STRENGTHS PROFILE</span><h1>'+esc(student.student_name)+'</h1><p>'+esc(student.class_name||'')+' · completed '+esc(student.created_at?new Date(student.created_at).toLocaleDateString('en-AU'):'')+'</p></div><div class="teacher-actions"><a class="secondary" href="/year5.html?teacher=1">← Back to teacher studio</a></div></div>'
  +'<section class="leadership-profile"><div class="leadership-profile-head"><span class="leadership-icon">'+esc(profile.icon)+'</span><div><span class="eyebrow">LEADERSHIP STORY</span><h2>'+esc(profile.title)+'</h2><p>'+esc(profile.summary)+'</p><div class="leadership-style-tags">'+profile.styles.map(style=>'<details><summary>'+esc(style)+'</summary><p>'+esc(window.LEADERSHIP_PROFILES.leadershipStyleDetails[style]||'')+'</p></details>').join('')+'</div></div></div><div class="leadership-profile-grid"><div><h3>How this may show up</h3><p>'+esc(profile.studentStory)+'</p><p>'+esc(profile.teacherContribution)+'</p><h3>Teaching conversation</h3><p>'+esc(profile.teacherPrompt)+'</p></div><div class="leadership-action"><span class="eyebrow">USEFUL OPPORTUNITY</span><p>'+esc(profile.teacherOpportunity)+'</p></div></div></section>'
  +'<section class="section-heading result-list-heading"><div><span class="eyebrow">SIGNATURE STRENGTHS</span><h2>Top five strengths</h2><p>Open a strength for its meaning and school example.</p></div></section><div class="strength-grid">'+ranked.slice(0,5).map(([name,value],index)=>'<article class="strength-card" style="'+theme(index)+'"><img class="strength-art" src="/assets/strengths/'+assetSlug(name)+'-v1.png" alt=""><span class="rank">STRENGTH '+String(index+1).padStart(2,'0')+'</span><h3>'+esc(name)+'</h3><span class="score-pill">'+esc(value)+' / 20</span><details class="strength-explainer"><summary>Explore this strength</summary>'+strengthContent(name)+'</details></article>').join('')+'</div>'
  +'<section class="section-heading result-list-heading"><div><span class="eyebrow">THE WHOLE PICTURE</span><h2>All 24 strengths</h2><p>Scores reflect this student’s self-ratings today.</p></div></section><div class="all-strengths">'+ranked.map(([name,value],index)=>'<details class="strength-row strength-row-detail" style="'+theme(index)+'"><summary><div class="tiny-icon">✦</div><div><b>'+esc(name)+'</b><div class="strength-meter"><div style="width:'+(Number(value)/20*100)+'%"></div></div></div><small>'+esc(value)+' / 20</small></summary><div class="strength-row-more">'+strengthContent(name)+'</div></details>').join('')+'</div>';
}
async function load(){
  const id=new URLSearchParams(location.search).get('student');
  if(!id){$('profileLoading').hidden=true;$('profileError').hidden=false;$('profileError').innerHTML='<h2>Choose a student first.</h2><p>Return to the teacher studio and select a student profile.</p><a class="primary" href="/year5.html?teacher=1">Open teacher studio</a>';return}
  try{
    const response=await fetch('/api/teacher',{credentials:'same-origin',cache:'no-store'});
    if(!response.ok)throw new Error(response.status===401?'Sign in through the teacher studio first.':'This profile could not be loaded.');
    const data=await response.json(),student=(data.submissions||[]).find(item=>String(item.id)===id);
    if(!student)throw new Error('This student profile is not available.');
    render(student);
  }catch(error){$('profileLoading').hidden=true;$('profileError').hidden=false;$('profileError').innerHTML='<h2>Teacher access needed</h2><p>'+esc(error.message)+'</p><a class="primary" href="/year5.html?teacher=1">Open teacher studio</a>';}
}
document.addEventListener('DOMContentLoaded',load);