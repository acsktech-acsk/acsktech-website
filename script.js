
document.querySelectorAll('[data-year]').forEach(e=>e.textContent=new Date().getFullYear());
const path=location.pathname.split('/').pop()||'index.html';
document.querySelectorAll('nav a').forEach(a=>{
  if(a.getAttribute('href')===path || (path==='' && a.getAttribute('href')==='index.html')) a.classList.add('active');
});
