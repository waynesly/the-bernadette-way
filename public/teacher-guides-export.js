(function(){
  const logo="/assets/brand/stbernadettes-horizontal-primary.png";
  const q=selector=>document.querySelector(selector);
  function page(title,content,index){
    return '<article class="guide-pdf-page pdf-page"><header><img src="'+logo+'" alt=""><span>THE BERNADETTE WAY · TEACHER GUIDE</span></header><div class="guide-pdf-banner"><p>ST BERNADETTE’S CATHOLIC PRIMARY SCHOOL</p><h1>'+title+'</h1><span>Private staff resource · reflection and teaching conversations</span></div><div class="guide-pdf-content">'+content+'</div><footer>The Bernadette Way · St Bernadette’s Catholic Primary School · '+index+'</footer></article>';
  }
  function pageFits(markup){
    const measure=document.createElement("div");
    measure.className="pdf-render guide-pdf-measure";
    measure.style.cssText="position:fixed;left:-14000px;top:0;width:980px;padding:42px;background:#fff;visibility:hidden;z-index:-1";
    measure.innerHTML=markup;
    document.body.appendChild(measure);
    const sheet=measure.querySelector(".guide-pdf-page");
    const footer=sheet?.querySelector("footer");
    const height=footer&&sheet?footer.getBoundingClientRect().bottom-sheet.getBoundingClientRect().top:Infinity;
    const fits=height<=1260;
    measure.remove();
    return fits;
  }
  function splitGuide(title,elements){
    const result=[];
    let current="";
    for(const element of elements){
      const block=element.outerHTML;
      if(current&&!pageFits(page(title,current+block,1))){result.push(current);current=block}
      else current+=block;
      // If a long table cannot fit on its own, split at row boundaries while repeating the heading.
      if(!pageFits(page(title,current,1))&&element.tagName==="TABLE"){
        current=current.slice(0,-block.length);
        if(current){result.push(current);current=""}
        const head=element.querySelector("thead")?.outerHTML||"";
        const rows=[...element.querySelectorAll("tbody tr")];
        let tableRows="";
        for(const row of rows){
          const next='<table class="table">'+head+'<tbody>'+tableRows+row.outerHTML+'</tbody></table>';
          if(tableRows&&!pageFits(page(title,next,1))){result.push('<table class="table">'+head+'<tbody>'+tableRows+'</tbody></table>');tableRows=row.outerHTML}
          else tableRows+=row.outerHTML;
        }
        current='<table class="table">'+head+'<tbody>'+tableRows+'</tbody></table>';
      }
    }
    if(current)result.push(current);
    return result;
  }
  window.downloadTeacherGuides=function(){
    const hero=q(".hero")?.outerHTML||"";
    const notice=q(".notice")?.outerHTML||"";
    const sections=[{title:"Teacher guides",elements:[hero,notice].map(html=>{const d=document.createElement("div");d.innerHTML=html;return d.firstElementChild}).filter(Boolean)}];
    for(const guide of document.querySelectorAll(".guide"))sections.push({title:guide.querySelector("h2")?.textContent||"Teacher guide",elements:[...guide.children].filter(el=>!el.matches("h2, .eyebrow, [data-download-guides]"))});
    const pages=[];
    for(const section of sections)for(const chunk of splitGuide(section.title,section.elements))pages.push({title:section.title,chunk});
    const markup=pages.map((item,i)=>page(item.title,item.chunk,i+1)).join("");
    return window.SosPdf?.download(markup,"the-bernadette-way-teacher-guides");
  };
  window.addEventListener("DOMContentLoaded",()=>{const button=q("[data-download-guides]");if(button)button.onclick=()=>window.downloadTeacherGuides()});
})();