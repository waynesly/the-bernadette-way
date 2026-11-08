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
links.forEach(([heading,items])=>{const group=document.createElement('div');group.className='site-nav-group';if(heading==='TEACHER WORKSPACE'||heading==='RESOURCES'){group.dataset.staffOnly='';group.hidden=true;}const label=document.createElement('span');label.className='site-nav-section';label.textContent=heading;group.append(label);items.forEach(([name,url])=>{const a=document.createElement('a');a.href=url;a.textContent=name;if(current===url||(current==='/index.html'&&url==='/'))a.setAttribute('aria-current','page');group.append(a)});nav.append(group)});
const access=document.createElement('div');access.className='site-nav-group';access.dataset.staffAccess='';const accessHeading=document.createElement('span');accessHeading.className='site-nav-section';accessHeading.textContent='STAFF ACCESS';access.append(accessHeading);const teacher=document.createElement('a');teacher.href='/staff-reflection.html';teacher.textContent='Teacher sign-in';teacher.dataset.teacherSignIn='';if(current==='/staff-reflection.html')teacher.setAttribute('aria-current','page');access.append(teacher);const admin=document.createElement('a');admin.href='/administration.html';admin.textContent='Administrator sign-in';admin.setAttribute('data-admin-nav','');if(current==='/administration.html')admin.setAttribute('aria-current','page');access.append(admin);nav.append(access);
return nav;
}
function boot(){
/* Load the same final navigation rules on every page, after page-specific CSS. */
if(!document.querySelector('link[data-unified-navigation]')){const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href='/unified-navigation.css?v=92';sheet.dataset.unifiedNavigation='';document.head.append(sheet)}
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
async function updateAccess(){const token=sessionStorage.getItem('bernadette.staff.session');let user=null;try{const r=await fetch('/api/staff-journal',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'whoami',...(token?{sessionToken:token}:{})}),cache:'no-store'});if(r.ok)user=(await r.json()).user}catch(e){}const signedIn=!!user;nav.querySelectorAll('[data-staff-only]').forEach(group=>{group.hidden=!signedIn});const teacher=nav.querySelector('[data-teacher-sign-in]');teacher.hidden=signedIn;const admin=nav.querySelector('[data-admin-nav]');admin.textContent=user?.role==='admin'?'Administration':'Administrator sign-in';admin.hidden=signedIn&&user.role!=='admin';}
updateAccess();window.addEventListener('bernadette:staff-session-changed',updateAccess);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();