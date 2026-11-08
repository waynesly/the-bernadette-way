/* Keyboard access for all My Gifts, My Growth check-in windows. */
(()=>{
  const quiz=()=>document.getElementById('quizScreen');
  const active=()=>quiz()&&!quiz().hidden&&!document.getElementById('studentView').hidden;
  const editable=el=>el?.closest('input,textarea,select,[contenteditable="true"],[role="textbox"]');
  const buttons=()=>[...document.querySelectorAll('#answers [data-answer]')];
  const pick=(n,advance=false)=>{
    if(!active()||n<1||n>5)return;
    if(advance){buttons()[n-1]?.click();return;}
    answers[index]=n;
    saveDraft();
    renderQuestion();
    buttons()[n-1]?.focus({preventScroll:true});
  };
  document.addEventListener('keydown',event=>{
    if(!active()||event.defaultPrevented||event.altKey||event.metaKey||editable(event.target))return;
    if(event.ctrlKey&&event.key==='Enter'){
      event.preventDefault();
      if(answers[index]!==null&&index===questions.length-1&&window.confirm('Finish and submit your check-in? You will not be able to change it afterwards.'))nextQuestion();
      return;
    }
    if(event.ctrlKey||event.shiftKey)return;
    if(/^[1-5]$/.test(event.key)){
      event.preventDefault();pick(Number(event.key),true);return;
    }
    if(['ArrowLeft','ArrowRight'].includes(event.key)&&event.target.closest('#answers')){
      event.preventDefault();
      const current=answers[index]||Number(event.target.dataset.answer)||1;
      pick(Math.max(1,Math.min(5,current+(event.key==='ArrowRight'?1:-1))));return;
    }
    // Native Tab, Shift+Tab, Space and Enter remain available on buttons.
  });
})();