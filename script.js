(function(){
  // ---- Utils ----
  const $ = (sel, ctx=document)=>ctx.querySelector(sel);
  const $$ = (sel, ctx=document)=>[...ctx.querySelectorAll(sel)];
  function fmt(n){ try{return new Intl.NumberFormat('es-CO').format(n);}catch(e){return String(n);} }
  function load(key){ try{ return JSON.parse(localStorage.getItem(key)||'null'); }catch(e){ return null; } }
  function save(key,val){ localStorage.setItem(key, JSON.stringify(val)); }

  // ---- Carrito ----
  const CART_KEY='anita_cart_v2';
  const $badge=$('#cart-badge'), $tbody=$('#cart-body'), $subtotal=$('#cart-subtotal');
  let cart = load(CART_KEY) || {};

  function addItem(id,name,price,qty){
    qty=Math.max(1,parseInt(qty||1,10));
    if(cart[id]) cart[id].qty+=qty; else cart[id]={id,name,price,qty};
    save(CART_KEY,cart); renderCart();
  }
  function setQty(id,qty){ if(cart[id]){ cart[id].qty=Math.max(1,parseInt(qty||1,10)); save(CART_KEY,cart); renderTotals(); updateBadge(); } }
  function removeItem(id){ delete cart[id]; save(CART_KEY,cart); renderCart(); }
  function renderCart(){
    $tbody.innerHTML='';
    Object.values(cart).forEach(it=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${it.name}</td>
        <td><input type="number" min="1" value="${it.qty}" data-id="${it.id}" class="cart-qty"></td>
        <td>$${fmt(it.price)}</td>
        <td>$${fmt(it.price*it.qty)}</td>
        <td><button class="btn sm outline cart-remove" data-id="${it.id}">✕</button></td>`;
      $tbody.appendChild(tr);
    });
    renderTotals(); bindCartEvents(); updateBadge();
  }
  function renderTotals(){
    const sum=Object.values(cart).reduce((s,it)=>s+it.price*it.qty,0);
    $subtotal.textContent='$'+fmt(sum);
  }
  function updateBadge(){ const c=Object.values(cart).reduce((s,it)=>s+it.qty,0); $badge.textContent=String(c); }
  function bindCartEvents(){
    $$('.cart-remove').forEach(b=>b.onclick=()=>removeItem(b.dataset.id));
    $$('.cart-qty').forEach(inp=>{
      inp.onchange=()=>setQty(inp.dataset.id, inp.value);
      inp.oninput =()=>setQty(inp.dataset.id, inp.value);
    });
  }
  $$('.add-to-cart').forEach(btn=>{
    btn.onclick=()=>{
      const card=btn.closest('.card');
      addItem(card.dataset.id, card.dataset.name, parseInt(card.dataset.price,10), card.querySelector('.qty').value);
      btn.textContent='Añadido ✓'; setTimeout(()=>btn.textContent='Añadir',900);
    };
  });
  renderCart();

  // ---- Login/Registro demo ----
  const USER_KEY='anita_user_v1'; const $form=$('#login-form'); const $chip=$('#user-chip'); const $box=$('.auth__session'); const $out=$('#logout-btn'); const $name=$('#logged-name');
  function getUser(){ return load(USER_KEY); } function setUser(u){ save(USER_KEY,u); } function clearUser(){ localStorage.removeItem(USER_KEY); }
  function updateAuthUI(){ const u=getUser(); if(u){ if($chip){$chip.textContent='Hola, '+(u.username||'Cliente');$chip.style.display='inline-block'} if($box){$box.style.display='block'} if($form){$form.style.display='none'} if($name){$name.textContent=u.username||'Cliente'} } else { if($chip){$chip.style.display='none'} if($box){$box.style.display='none'} if($form){$form.style.display='grid'} } }
  if($form){ $form.onsubmit=()=>{ const inputs=[...$form.querySelectorAll('input')]; const data={}; inputs.forEach(i=>{ const l=(i.parentElement?.textContent||'').toLowerCase(); if(l.includes('correo')||l.includes('celular')) data.contact=i.value.trim(); else if(l.includes('contraseña')) data.password=i.value.trim(); else if(l.includes('usuario')) data.username=i.value.trim(); }); if(!data.username) data.username='Cliente'; setUser({username:data.username, contact:data.contact}); updateAuthUI(); alert('Sesión iniciada como '+data.username+' (demo).'); return false; }; }
  if($out){ $out.onclick=()=>{ clearUser(); updateAuthUI(); }; }
  updateAuthUI();

  // ---- Filtros y búsqueda ----
  const $products=$('#products'); const $filterText=$('#filter-text'); const $search=$('#search-input'); const $searchBtn=$('#search-btn');
  function applyFilters(){
    const cat=($('input[name="cat"]:checked')||{value:'all'}).value;
    const q=($filterText?.value||'').trim().toLowerCase();
    $$('.card',$products).forEach(card=>{
      const inCat = cat==='all' || card.dataset.category===cat;
      const inText = !q || card.dataset.name.toLowerCase().includes(q);
      card.style.display = (inCat && inText) ? '' : 'none';
    });
  }
  $$('input[name="cat"]').forEach(r=>r.onchange=applyFilters);
  if($filterText){ $filterText.oninput=applyFilters; }
  if($search){ $search.oninput=()=>{ $filterText.value=$search.value; applyFilters(); }; }
  if($searchBtn){ $searchBtn.onclick=applyFilters; }
  applyFilters();
})();