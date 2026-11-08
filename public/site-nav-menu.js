/* Single navigation source for every Bernadette Way page. */
(()=> {
const links=[
['THE BERNADETTE WAY',[['Home','/'],['Our Patron & Purpose','/our-patron.html']]],
['STUDENT PATHWAYS',[['My Gifts, My Growth · Years 3–6','/classroom.html'],['Lead with Heart · Year 5','/year5.html']]],
['TEACHER WORKSPACE',[['Teacher studios','/teacher-studios.html'],['Set up a class','/teacher-setup.html'],['Teaching guides','/teacher-guides.html'],['Private reflection journal','/staff-reflection.html']]],
['RESOURCES',[['Move Up Day','/move-up-day.html'],['Implementation evidence','/implementation-evidence.html'],['Development roadmap','/development-roadmap.html']]]
];
const brand='<a class="school-brand" href="/" aria-label="The Bernadette Way home"><img src="/assets/brand/stbernadettes-horizontal-reverse.png" alt="St Bernadette’s Catholic Primary School"></a>';
const current=location.pathname;
function makeNav(){
const nav=document.createElement('nav');nav.className='site-nav-links';nav.setAttribute('aria-label','Primary navigation');
links.forEach(([heading,items])=>{const group=document.createElement('div');group.className='site-nav-group';const label=document.createElement('span');label.className='site-nav-section';label.textContent=heading;group.append(label);items.forEach(([name,url])=>{const a=document.createElement('a');a.href=url;a.textContent=name;if(current===url||(current==='/index.html'&&url==='/'))a.setAttribute('aria-current','page');group.append(a)});nav.append(group)});
const admin=document.createElement('a');admin.href='/administration.html';admin.textContent='Administration';admin.setAttribute('data-admin-nav','');admin.hidden=true;if(current==='/administration.html'){admin.hidden=false;admin.setAttribute('aria-current','page')}nav.querySelectorAll('.site-nav-group')[2].append(admin);
return nav;
}
function boot(){
let header=document.querySelector('header.site-nav');
if(!header){const existing=document.body.querySelector(':scope > header');if(existing){header=existing;header.classList.add('site-nav','unified-site-nav')}else{header=document.createElement('header');header.className='site-nav unified-site-nav';document.body.insertBefore(header,document.body.firstChild)}}
else header.classList.add('unified-site-nav');
document.body.classList.add('site-side-nav');
const oldNav=header.querySelector('.site-nav-links');
const actions=oldNav?[...oldNav.querySelectorAll('button[id]')]:[];
header.replaceChildren();
header.insertAdjacentHTML('afterbegin',brand);
const nav=makeNav();actions.forEach(b=>nav.append(b));header.append(nav);
const button=document.createElement('button');button.type='button';button.className='site-menu-toggle';button.setAttribute('aria-controls','primary-navigation');button.setAttribute('aria-expanded','false');button.textContent='☰ Menu';nav.id='primary-navigation';header.insertBefore(button,nav);
function close(){nav.classList.remove('is-open');button.setAttribute('aria-expanded','false');button.textContent='☰ Menu'}
button.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');button.setAttribute('aria-expanded',String(open));button.textContent=open?'✕ Close':'☰ Menu'});
nav.addEventListener('click',e=>{if(e.target.closest('a'))close()});header.addEventListener('keydown',e=>{if(e.key==='Escape'){close();button.focus()}});document.addEventListener('click',e=>{if(!header.contains(e.target))close()});
window.matchMedia('(min-width:901px)').addEventListener('change',e=>{if(e.matches)close()});
fetch('/api/staff-journal',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'whoami'}),cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>{if(d?.user?.role==='admin')nav.querySelector('[data-admin-nav]').hidden=false}).catch(()=>{});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();