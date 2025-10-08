// Carrito de compras + demo de login/registro (solo frontend, localStorage)
(function(){
  // ---- Carrito ----
  const CART_KEY = 'anita_cart_v1';
  const $badge = document.getElementById('cart-badge');
  const $body  = document.getElementById('cart-body');
  const $sub   = document.getElementById('cart-subtotal');
  let cart = load(CART_KEY) || {};

  function load(key){ try{ return JSON.parse(localStorage.getItem(key)||'null'); }catch(e){ return null; } }
  function save(key,val){ localStorage.setItem(key, JSON.stringify(val)); }

  function addItem(id,name,price,qty){
    qty = Math.max(1, parseInt(qty||1,10));
    if(cart[id]) cart[id].qty += qty;
    else cart[id] = {id,name,price,qty};
    save(CART_KEY, cart); render();
  }
  function removeItem(id){ delete cart[id]; save(CART_KEY, cart); render(); }
  function setQty(id,qty){
    qty = Math.max(1, parseInt(qty||1,10));
    if(cart[id]){ cart[id].qty = qty; save(CART_KEY, cart); renderTotals(); updateBadge(); }
  }
  function render(){
    $body.innerHTML = '';
    Object.values(cart).forEach(it=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${it.name}</td>
        <td><input type="number" min="1" value="${it.qty}" data-id="${it.id}" class="cart-qty"></td>
        <td>$${fmt(it.price)}</td>
        <td>$${fmt(it.price*it.qty)}</td>
        <td><button class="btn sm outline cart-remove" data-id="${it.id}">✕</button></td>`;
      $body.appendChild(tr);
    });
    renderTotals(); bindCartEvents(); updateBadge();
  }
  function renderTotals(){
    const total = Object.values(cart).reduce((s,it)=>s+it.price*it.qty,0);
    $sub.textContent = `$${fmt(total)}`;
  }
  function updateBadge(){
    const count = Object.values(cart).reduce((s,it)=>s+it.qty,0);
    $badge.textContent = String(count);
  }
  function bindCartEvents(){
    document.querySelectorAll('.cart-remove').forEach(b=>b.onclick=()=>removeItem(b.dataset.id));
    document.querySelectorAll('.cart-qty').forEach(inp=>{
      inp.onchange = ()=> setQty(inp.dataset.id, inp.value);
      inp.oninput  = ()=> setQty(inp.dataset.id, inp.value);
    });
  }
  function fmt(n){ try{return new Intl.NumberFormat('es-CO').format(n);}catch(e){return String(n);} }

  document.querySelectorAll('.add-to-cart').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const card = btn.closest('.card');
      addItem(card.dataset.id, card.dataset.name, parseInt(card.dataset.price,10), card.querySelector('.qty').value);
      btn.textContent='Añadido ✓'; setTimeout(()=>btn.textContent='Añadir',900);
    });
  });

  render();

  // ---- Login/Registro demo (no seguro) ----
  const USER_KEY='anita_user_v1';
  const $form = document.getElementById('login-form');
  const $chip = document.getElementById('user-chip');
  const $box  = document.querySelector('.auth__session');
  const $out  = document.getElementById('logout-btn');
  const $name = document.getElementById('logged-name');

  function getUser(){ return load(USER_KEY); }
  function setUser(u){ save(USER_KEY,u); }
  function clearUser(){ localStorage.removeItem(USER_KEY); }

  function updateAuthUI(){
    const u = getUser();
    if(u){
      if($chip){ $chip.textContent='Hola, '+(u.username||'Cliente'); $chip.style.display='inline-block'; }
      if($box){ $box.style.display='block'; }
      if($form){ $form.style.display='none'; }
      if($name){ $name.textContent = u.username || 'Cliente'; }
    }else{
      if($chip){ $chip.style.display='none'; }
      if($box){ $box.style.display='none'; }
      if($form){ $form.style.display='grid'; }
    }
  }
  if($form){
    $form.onsubmit = ()=>{
      const inputs=[...$form.querySelectorAll('input')];
      const data={};
      inputs.forEach(i=>{
        const label=(i.parentElement?.textContent||'').toLowerCase();
        if(label.includes('correo')||label.includes('celular')) data.contact=i.value.trim();
        else if(label.includes('contraseña')) data.password=i.value.trim();
        else if(label.includes('usuario')) data.username=i.value.trim();
      });
      if(!data.username) data.username='Cliente';
      setUser({username:data.username, contact:data.contact});
      updateAuthUI();
      alert('Sesión iniciada como '+data.username+' (demo sin backend).');
      return false;
    };
  }
  if($out){ $out.onclick=()=>{ clearUser(); updateAuthUI(); }; }

  updateAuthUI();
})();