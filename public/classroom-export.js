(function(){
  const q=id=>document.getElementById(id);
  const safe=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const logo="/assets/brand/stbernadettes-horizontal-primary.png";
  const download=(markup,name)=>window.SosPdf?.download(markup,name);
  const cards=(items,size)=>items.reduce((all,item,index)=>{if(index%size===0)all.push([]);all[all.length-1].push(item);return all},[]);
  window.printShell=function(title,subtitle,body,art="/assets/classroom/windows/reflection-v1.png",fileName="classroom-report"){
    return download('<article class="brand-report classroom-report-page pdf-page"><header class="pdf-report-brand"><img src="'+logo+'" alt=""><span>SCIENCE OF STRENGTHS · CLASSROOM CHECK-IN</span></header><section class="classroom-report-hero"><div><p>'+safe(subtitle)+'</p><h1>'+safe(title)+'</h1><span>Private teaching conversation · strengths can grow with practice.</span></div><img src="'+safe(art)+'" alt=""></section><main class="classroom-report-content">'+body+'</main><footer>St Bernadette’s Catholic Primary School · Science of Strengths</footer></article>',fileName);
  };
  window.printCodes=function(){
    const people=(teacherClass?.roster?.students||teacherData?.students||[]).filter(person=>person.join_code);
    if(!people.length)return alert("Open a class with student codes before downloading join cards.");
    const className=teacherData?.classroom?.class_name||teacherClass?.roster?.class_name||"Classroom";
    const markup=cards(people,4).map(group=>'<article class="join-card-sheet pdf-page"><header class="pdf-report-brand"><img src="'+logo+'" alt=""><span>CLASSROOM STRENGTHS CHECK-IN</span></header><h1>'+safe(className)+' — student join cards</h1><p class="pdf-intro">Cut along the dotted lines and give each student only their card.</p><div class="join-card-grid">'+group.map(person=>'<section class="code-card"><img class="join-card-logo" src="'+logo+'" alt=""><p class="card-kicker">CLASSROOM STRENGTHS CHECK-IN</p><h2>'+safe(person.display_name)+'</h2><p class="card-prompt">Go to <b>'+location.host+'/classroom.html</b> and enter your private code.</p><code>'+safe(person.join_code)+'</code><p class="card-note">Keep this card private.</p></section>').join("")+'</div><footer>Private educational reflection · Keep every code private.</footer></article>').join("");
    return download(markup,className+"-classroom-join-cards");
  };
  window.printStudentProfile=function(){
    const attempt=attempts?.[student?.current_window];
    if(!student||!attempt?.scores)return;
    const ordered=Object.entries(scoreDomains(attempt.scores)).sort((a,b)=>(b[1].average||0)-(a[1].average||0));
    const domainCards=ordered.map(([id,value,index])=>{const domain=DOMAINS.find(item=>item.id===id)||{icon:"✦",name:value.name||"Classroom habit"};return '<section class="'+(index===0?'profile-bright-spot':'')+'"><p>'+safe(domain.icon+" "+domain.name)+'</p><h3>'+safe(value.band)+'</h3><span>'+safe(value.next_step)+'</span></section>'}).join("");
    const mission=(ordered.find(([,value])=>value.average<3)||ordered[ordered.length-1])?.[1]?.next_step||"Choose one helpful action to try today.";
    const art="/assets/classroom/windows/"+(windowArt?.[student.current_window]||"reflection-v1")+".png";
    const markup='<article class="student-profile-sheet classroom-student-pdf pdf-page"><header class="pdf-report-brand"><img src="'+logo+'" alt=""><span>SCIENCE OF STRENGTHS · CLASSROOM CHECK-IN</span></header><section class="student-profile-hero"><div><p>MY CLASSROOM STRENGTHS</p><h1>'+safe(student.display_name)+'’s strengths picture</h1><h2>'+safe(WINDOW_LABEL?.[student.current_window]||"Classroom check-in")+'</h2><small>This is a picture of today. It is not a label — every strength can grow.</small></div><img src="'+art+'" alt=""></section><h2 class="student-profile-heading">My classroom superpowers</h2><div class="student-profile-grid">'+domainCards+'</div><section class="student-profile-mission"><b>✦ MY NEXT SMALL MISSION</b><h2>'+safe(mission)+'</h2><p>Choose one moment today to give it a try.</p></section><footer>St Bernadette’s Catholic Primary School · Science of Strengths · Private student reflection</footer></article>';
    return download(markup,student.display_name+"-classroom-profile");
  };
  window.addEventListener("DOMContentLoaded",()=>{
    const codes=q("printCodes"),studentProfile=q("printStudentProfile");
    if(codes)codes.onclick=()=>window.printCodes();
    if(studentProfile)studentProfile.onclick=()=>window.printStudentProfile();
  });
})();