// Carrito de compras simple (vanilla JS) con persistencia en localStorage
(function(){
  const CART_KEY = 'anita_cart_v1';
  const $badge = document.getElementById('cart-badge');
  const $body = document.getElementById('cart-body');
  const $subtotal = document.getElementById('cart-subtotal');

  let cart = loadCart();

  function loadCart(){
    try{
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : {};
    }catch(e){ return {}; }
  }
  function saveCart(){
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function addItem(id, name, price, qty){
    qty = Math.max(1, parseInt(qty||1, 10));
    if(cart[id]){
      cart[id].qty += qty;
    }else{
      cart[id] = { id, name, price, qty };
    }
    saveCart();
    render();
  }

  function removeItem(id){
    delete cart[id];
    saveCart();
    render();
  }

  function setQty(id, qty){
    qty = Math.max(1, parseInt(qty||1,10));
    if(cart[id]){ cart[id].qty = qty; saveCart(); renderTotals(); updateBadge(); }
  }

  function render(){
    $body.innerHTML = '';
    Object.values(cart).forEach(item => {
      const tr = document.createElement('tr');
      const subtotal = item.price * item.qty;
      tr.innerHTML = `
        <td>${item.name}</td>
        <td><input type="number" min="1" value="${item.qty}" data-id="${item.id}" class="cart-qty"></td>
        <td>$${formatCOP(item.price)}</td>
        <td>$${formatCOP(subtotal)}</td>
        <td><button class="btn sm outline cart-remove" data-id="${item.id}">✕</button></td>
      `;
      $body.appendChild(tr);
    });
    renderTotals();
    bindCartEvents();
    updateBadge();
  }

  function renderTotals(){
    const sum = Object.values(cart).reduce((acc, it)=>acc + it.price * it.qty, 0);
    $subtotal.textContent = `$${formatCOP(sum)}`;
  }

  function updateBadge(){
    const count = Object.values(cart).reduce((acc, it)=>acc + it.qty, 0);
    $badge.textContent = String(count);
  }

  function bindCartEvents(){
    document.querySelectorAll('.cart-remove').forEach(btn=>{
      btn.addEventListener('click', e=>{
        const id = btn.dataset.id; removeItem(id);
      });
    });
    document.querySelectorAll('.cart-qty').forEach(inp=>{
      inp.addEventListener('change', e=>{
        const id = inp.dataset.id; setQty(id, inp.value);
      });
      inp.addEventListener('input', e=>{
        const id = inp.dataset.id; setQty(id, inp.value);
      });
    });
  }

  function formatCOP(num){
    try{
      return new Intl.NumberFormat('es-CO').format(num);
    }catch(e){ return num.toFixed(0); }
  }

  // Vincular botones "Añadir"
  document.querySelectorAll('.add-to-cart').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const card = btn.closest('.card');
      const id = card.dataset.id;
      const name = card.dataset.name;
      const price = parseInt(card.dataset.price, 10);
      const qtyInput = card.querySelector('.qty');
      const qty = qtyInput ? parseInt(qtyInput.value || '1', 10) : 1;
      addItem(id, name, price, qty);
      // feedback rápido
      btn.textContent = 'Añadido ✓';
      setTimeout(()=>btn.textContent='Añadir', 1000);
    });
  });

  // Primera renderización
  render();
})();