(function(){
  const q=id=>document.getElementById(id);
  const safe=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const logo="/assets/brand/stbernadettes-horizontal-primary.png";
  const cards=(items,size)=>items.reduce((all,item,index)=>{if(index%size===0)all.push([]);all[all.length-1].push(item);return all},[]);
  window.printCodes=function(){
    if(!current?.students)return alert("Open a class created on this device to download its student codes.");
    const name=data?.roster?.class_name||"Year 5 class";
    const markup=cards(current.students,4).map(group=>'<article class="join-card-sheet pdf-page"><header class="pdf-report-brand"><img src="'+logo+'" alt=""><span>SCIENCE OF STRENGTHS · YEAR 5</span></header><h1>'+safe(name)+' — student join cards</h1><p class="pdf-intro">Cut along the dotted lines and give each student only their card.</p><div class="join-card-grid">'+group.map(student=>'<section class="code-card"><img class="join-card-logo" src="'+logo+'" alt=""><p class="card-kicker">YEAR 5 LEADERSHIP ADVENTURE</p><h2>'+safe(student.display_name)+'</h2><p class="card-prompt">Go to <b>'+location.host+'</b> and enter your private code.</p><code>'+safe(student.join_code)+'</code><p class="card-note">Keep this card private.</p></section>').join("")+'</div><footer>St Bernadette’s Catholic Primary School · Keep every code private.</footer></article>').join("");
    return window.SosPdf?.download(markup,name+"-year-5-join-cards");
  };
  window.addEventListener("DOMContentLoaded",()=>{const button=q("print");if(button)button.onclick=()=>window.printCodes()});
})();