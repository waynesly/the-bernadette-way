(function(){
  const logo="/assets/brand/stbernadettes-horizontal-primary.png";
  const q=selector=>document.querySelector(selector);
  function page(title,content,index){
    return '<article class="guide-pdf-page pdf-page"><header><img src="'+logo+'" alt=""><span>THE BERNADETTE WAY · TEACHER GUIDE</span></header><div class="guide-pdf-banner"><p>ST BERNADETTE’S CATHOLIC PRIMARY SCHOOL</p><h1>'+title+'</h1><span>Private staff resource · reflection and teaching conversations</span></div><div class="guide-pdf-content">'+content+'</div><footer>The Bernadette Way · St Bernadette’s Catholic Primary School · '+index+'</footer></article>';
  }
  window.downloadTeacherGuides=function(){
    const hero=q(".hero")?.outerHTML||"";
    const notice=q(".notice")?.outerHTML||"";
    const guides=[...document.querySelectorAll(".guide")];
    const markup=page("Teacher guides",hero+notice,1)+guides.map((guide,index)=>page(guide.querySelector("h2")?.textContent||"Teacher guide",guide.innerHTML,index+2)).join("");
    return window.SosPdf?.download(markup,"the-bernadette-way-teacher-guides");
  };
  window.addEventListener("DOMContentLoaded",()=>{const button=q("[data-download-guides]");if(button)button.onclick=()=>window.downloadTeacherGuides()});
})();