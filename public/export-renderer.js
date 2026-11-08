(function(){
  const A4={width:210,height:297,margin:10};
  const escapeFileName=name=>String(name||"science-of-strengths").replace(/[^a-z0-9._-]+/gi,"-").replace(/-+/g,"-").replace(/^-|-$/g,"");
  const waitForImages=async root=>{
    const images=[...root.querySelectorAll("img")];
    await Promise.race([
      Promise.all(images.map(image=>{
        if(image.complete&&image.naturalWidth)return Promise.resolve();
        if(image.decode)return image.decode().catch(()=>{});
        return new Promise(resolve=>{image.onload=image.onerror=resolve});
      })),
      new Promise(resolve=>setTimeout(resolve,2200))
    ]);
  };
  async function download(markup,fileName){
    if(!window.html2canvas||!window.jspdf?.jsPDF){alert("The PDF download tools are still loading. Please try again in a moment.");return;}
    const area=document.getElementById("printArea");
    if(!area)return;
    area.className="pdf-render";
    area.innerHTML=markup;
    try{
      await waitForImages(area);
      const pages=[...area.querySelectorAll(".pdf-page")];
      const targets=pages.length?pages:[area.firstElementChild].filter(Boolean);
      const doc=new window.jspdf.jsPDF({unit:"mm",format:"a4",orientation:"portrait",compress:true});
      for(let page=0;page<targets.length;page++){
        const node=targets[page];
        const canvas=await window.html2canvas(node,{scale:2,useCORS:true,backgroundColor:"#ffffff",logging:false,width:node.scrollWidth,height:node.scrollHeight});
        const image=canvas.toDataURL("image/jpeg",.94);
        const printableWidth=A4.width-A4.margin*2,printableHeight=A4.height-A4.margin*2;
        const ratio=Math.min(printableWidth/canvas.width,printableHeight/canvas.height);
        const width=canvas.width*ratio,height=canvas.height*ratio;
        if(page)doc.addPage();
        doc.addImage(image,"JPEG",(A4.width-width)/2,(A4.height-height)/2,width,height,undefined,"FAST");
      }
      doc.save(escapeFileName(fileName)+".pdf");
    }catch(error){
      console.error(error);
      alert("We could not prepare this PDF. Please try again.");
    }finally{
      area.innerHTML="";
      area.className="";
    }
  }
  window.SosPdf={download,waitForImages};
})();