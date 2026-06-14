// ===========================
// GOOGLE FORM ENTRY IDs
// ===========================
const FORM_ENTRY_IDS = {
    orderId: "entry.1483143602",
    orderDate: "entry.449507396",
    fullName: "entry.1068467644",
    email: "entry.378194854",
    phone: "entry.1883290601",
    address: "entry.1906219745",
    city: "entry.1642201606",
    state: "entry.352559150",
    pincode: "entry.183154916",
    product: "entry.1110917443",
    amount: "entry.923159178",
    orderType: "entry.1027281419",
    paymentScreenshot: "entry.881326303",
    referenceImage: "entry.1483143602"
};

const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSfs2bPWuTaBA4Yjh-jyelwRG8mn09nIFdr0ybaDzJKE7k4ugA/formResponse";

// ===========================
// CART & WISHLIST STORAGE
// ===========================
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
let customers = JSON.parse(localStorage.getItem("customers")) || [];
let currentCustomer = JSON.parse(localStorage.getItem("currentCustomer")) || null;

// Store full product details for cart/wishlist
let allDrawings = [];
let allKeychains = [];

updateCounters();
updateCustomerDisplay();

// ===========================
// MONTHLY OFFER CHECK
// ===========================
function isMonthlyOfferDay() {
    const today = new Date();
    return today.getDate() === 1;
}

function getMonthlyOfferDiscount() {
    return isMonthlyOfferDay() ? 0.10 : 0;
}

// ===========================
// TRACK FIRST TIME BUYERS
// ===========================
let drawingBuyers = JSON.parse(localStorage.getItem("drawingBuyers")) || [];
let keychainBuyers = JSON.parse(localStorage.getItem("keychainBuyers")) || [];
let commissionBuyers = JSON.parse(localStorage.getItem("commissionBuyers")) || [];

function getDrawingDiscount() {
    return drawingBuyers.length < 20 ? 0.20 : 0;
}
function getKeychainDiscount() {
    return keychainBuyers.length < 20 ? 0.20 : 0;
}
function getCommissionDiscount() {
    return commissionBuyers.length < 10 ? 0.40 : 0;
}

function getTotalDiscount(productType) {
    let totalDiscount = getMonthlyOfferDiscount();
    if(productType === 'drawing') totalDiscount += getDrawingDiscount();
    else if(productType === 'keychain') totalDiscount += getKeychainDiscount();
    else if(productType === 'commission') totalDiscount += getCommissionDiscount();
    return Math.min(totalDiscount, 0.50);
}

function markDrawingBuyer(email) { if(email && !drawingBuyers.includes(email) && drawingBuyers.length < 20) { drawingBuyers.push(email); localStorage.setItem("drawingBuyers", JSON.stringify(drawingBuyers)); } }
function markKeychainBuyer(email) { if(email && !keychainBuyers.includes(email) && keychainBuyers.length < 20) { keychainBuyers.push(email); localStorage.setItem("keychainBuyers", JSON.stringify(keychainBuyers)); } }
function markCommissionBuyer(email) { if(email && !commissionBuyers.includes(email) && commissionBuyers.length < 10) { commissionBuyers.push(email); localStorage.setItem("commissionBuyers", JSON.stringify(commissionBuyers)); } }

// ===========================
// CUSTOMER LOGIN SYSTEM
// ===========================
function showLoginPopup() { document.getElementById("loginPopup").style.display = "block"; }
function closeLoginPopup() { document.getElementById("loginPopup").style.display = "none"; }

function loginCustomer() {
    const email = document.getElementById("loginEmail")?.value.trim() || "";
    if(!email) { alert("Please enter your email address"); return; }
    let customer = customers.find(c => c.email === email);
    if(!customer) {
        const fullName = prompt("Welcome! Please enter your full name:");
        const phone = prompt("Please enter your phone number:");
        const address = prompt("Please enter your complete address:");
        const city = prompt("Please enter your city:");
        const state = prompt("Please enter your state:");
        const pincode = prompt("Please enter your pincode (6 digits):");
        if(!fullName || !phone || !address || !city || !state || !pincode) { alert("All fields are required!"); return; }
        customer = { email, fullName, phone, address, city, state, pincode, orderCount: 0, totalSpent: 0, joinDate: new Date().toLocaleString() };
        customers.push(customer);
        localStorage.setItem("customers", JSON.stringify(customers));
        alert("✅ Account created successfully!");
    }
    currentCustomer = customer;
    localStorage.setItem("currentCustomer", JSON.stringify(currentCustomer));
    updateCustomerDisplay();
    closeLoginPopup();
    alert(`Welcome back ${customer.fullName}!`);
}

function logoutCustomer() { currentCustomer = null; localStorage.removeItem("currentCustomer"); updateCustomerDisplay(); alert("Logged out successfully"); }

function updateCustomerDisplay() {
    const customerInfo = document.getElementById("customerInfo");
    if(customerInfo) {
        if(currentCustomer) {
            customerInfo.innerHTML = `<div style="background:#00d4ff; color:black; padding:5px 10px; border-radius:20px; font-size:12px;">👤 ${currentCustomer.fullName} <button onclick="logoutCustomer()" style="margin-left:10px; background:red; color:white; border:none; border-radius:10px; padding:2px 8px; cursor:pointer;">Logout</button></div>`;
        } else {
            customerInfo.innerHTML = `<button onclick="showLoginPopup()" style="background:#00d4ff; color:black; border:none; border-radius:20px; padding:5px 15px; cursor:pointer;">🔐 Login / Signup</button>`;
        }
    }
}

function updateCounters() {
    const cartCount = document.getElementById("cartCount");
    const wishlistCount = document.getElementById("wishlistCount");
    if(cartCount) cartCount.innerText = cart.length;
    if(wishlistCount) wishlistCount.innerText = wishlist.length;
}

// ===========================
// CART PAGE - SHOW PRODUCT CARDS
// ===========================
function viewCart() {
    if(cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    
    // Create modal popup for cart
    let modalHtml = `
        <div id="cartModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:10001; overflow-y:auto; padding:20px;">
            <div style="background:white; color:black; max-width:600px; margin:20px auto; padding:20px; border-radius:10px;">
                <button onclick="closeCartModal()" style="float:right; background:red; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Close</button>
                <h2>🛒 YOUR CART</h2>
                <div id="cartItemsList" style="max-height:400px; overflow-y:auto;">
    `;
    
    let total = 0;
    for(let i = 0; i < cart.length; i++) {
        const item = cart[i];
        total += item.price;
        modalHtml += `
            <div style="border:1px solid #ddd; margin:10px 0; padding:10px; border-radius:5px; display:flex; gap:10px;">
                <div>
                    <h4>${item.product}</h4>
                    <p>Price: ₹${item.price}</p>
                </div>
            </div>
        `;
    }
    
    modalHtml += `
                </div>
                <h3>Total: ₹${total}</h3>
                <button onclick="checkoutCart()" style="width:100%; padding:12px; background:#00d4ff; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Proceed to Checkout</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeCartModal() {
    const modal = document.getElementById("cartModal");
    if(modal) modal.remove();
}

function checkoutCart() {
    closeCartModal();
    if(cart.length > 0) {
        showDeliveryForm(cart[0].product, cart[0].price, 'cart', Date.now());
    }
}

// ===========================
// WISHLIST PAGE - SHOW PRODUCT CARDS
// ===========================
function viewWishlist() {
    if(wishlist.length === 0) {
        alert("Your wishlist is empty!");
        return;
    }
    
    // Create modal popup for wishlist
    let modalHtml = `
        <div id="wishlistModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:10001; overflow-y:auto; padding:20px;">
            <div style="background:white; color:black; max-width:600px; margin:20px auto; padding:20px; border-radius:10px;">
                <button onclick="closeWishlistModal()" style="float:right; background:red; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Close</button>
                <h2>❤️ YOUR WISHLIST</h2>
                <div id="wishlistItemsList" style="max-height:400px; overflow-y:auto;">
    `;
    
    for(let i = 0; i < wishlist.length; i++) {
        const item = wishlist[i];
        modalHtml += `
            <div style="border:1px solid #ddd; margin:10px 0; padding:10px; border-radius:5px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h4>${item}</h4>
                </div>
                <button onclick="addToCartFromWishlist('${item.replace(/'/g, "\\'")}')" style="background:#00d4ff; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">Add to Cart</button>
            </div>
        `;
    }
    
    modalHtml += `
                </div>
                <button onclick="clearWishlist()" style="width:100%; margin-top:15px; padding:12px; background:#ff0080; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Clear Wishlist</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeWishlistModal() {
    const modal = document.getElementById("wishlistModal");
    if(modal) modal.remove();
}

function addToCartFromWishlist(productName) {
    // Find product price from loaded data
    let price = 0;
    const drawing = allDrawings.find(d => d.name === productName);
    const keychain = allKeychains.find(k => k.name === productName);
    
    if(drawing) {
        price = getTotalDiscount('drawing') > 0 ? Math.floor((drawing.price + drawing.delivery) * (1 - getTotalDiscount('drawing'))) : drawing.price + drawing.delivery;
    } else if(keychain) {
        price = getTotalDiscount('keychain') > 0 ? Math.floor(keychain.price * (1 - getTotalDiscount('keychain'))) : keychain.price;
    }
    
    addCart(productName, price);
    alert(`${productName} added to cart!`);
}

function clearWishlist() {
    if(confirm("Clear entire wishlist?")) {
        wishlist = [];
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        updateCounters();
        closeWishlistModal();
        alert("Wishlist cleared!");
    }
}

// ===========================
// LOAD PRODUCTS
// ===========================
let currentDrawingsPage = 1, currentKeychainsPage = 1;
const perPage = 6;

async function loadDrawings() {
    try {
        const response = await fetch('data/drawings.json');
        allDrawings = await response.json();
        renderDrawings();
    } catch(error) { console.error("Error loading drawings:", error); document.getElementById("drawingsContainer").innerHTML = "<p style='text-align:center;color:red;'>Error loading drawings.</p>"; }
}
function renderDrawings() {
    const container = document.getElementById("drawingsContainer");
    if(!container) return;
    if(allDrawings.length === 0) { container.innerHTML = "<p style='text-align:center;'>No drawings available.</p>"; return; }
    const start = (currentDrawingsPage - 1) * perPage;
    const pageDrawings = allDrawings.slice(start, start + perPage);
    container.innerHTML = pageDrawings.map(d => {
        const originalPrice = d.price + d.delivery;
        const discount = getTotalDiscount('drawing');
        const discountedPrice = discount > 0 ? Math.floor(originalPrice * (1 - discount)) : originalPrice;
        const discountPercent = Math.floor(discount * 100);
        const discountHtml = discount > 0 ? `<span style="color:#00ff88; font-size:12px;"> (${discountPercent}% OFF! Was ₹${originalPrice})</span>` : '';
        if(d.sold) return `<div class="card"><img src="${d.image}" alt="${d.name}" onerror="this.src='images/placeholder.jpg'"><h3>${d.name}</h3><p>${d.description}</p><p>Size: ${d.size} | Paper: ${d.paper}</p><p><strong style="color:#ff4444;">₹${discountedPrice}</strong>${discountHtml}</p><div class="sold-badge">SOLD OUT</div></div>`;
        return `<div class="card"><img src="${d.image}" alt="${d.name}" onerror="this.src='images/placeholder.jpg'"><h3>${d.name}</h3><p>${d.description}</p><p>Size: ${d.size} | Paper: ${d.paper}</p><p><strong style="color:#00ff88;">₹${discountedPrice}</strong>${discountHtml}</p><div class="buttons"><button onclick="addWishlist('${d.name}')">❤️ Wishlist</button><button onclick="addCart('${d.name}', ${discountedPrice})">🛒 Cart</button><button onclick="showDeliveryForm('${d.name}', ${discountedPrice}, 'drawing', ${d.id})">💳 Buy Now</button></div></div>`;
    }).join('');
    updateDrawingsPagination();
}
function updateDrawingsPagination() {
    const paginationDiv = document.getElementById("drawingsPagination");
    if(!paginationDiv) return;
    const totalPages = Math.ceil(allDrawings.length / perPage);
    if(totalPages <= 1) { paginationDiv.innerHTML = ""; return; }
    let buttons = '<div class="pagination">';
    for(let i = 1; i <= totalPages; i++) buttons += `<button onclick="goToDrawingsPage(${i})" ${i === currentDrawingsPage ? 'style="background:#00d4ff;color:black;"' : ''}>${i}</button>`;
    buttons += '</div>';
    paginationDiv.innerHTML = buttons;
}
function goToDrawingsPage(page) { currentDrawingsPage = page; renderDrawings(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

async function loadKeychains() {
    try {
        const response = await fetch('data/keychains.json');
        allKeychains = await response.json();
        renderKeychains();
    } catch(error) { console.error("Error loading keychains:", error); document.getElementById("keychainsContainer").innerHTML = "<p style='text-align:center;color:red;'>Error loading keychains.</p>"; }
}
function renderKeychains() {
    const container = document.getElementById("keychainsContainer");
    if(!container) return;
    if(allKeychains.length === 0) { container.innerHTML = "<p style='text-align:center;'>No keychains available.</p>"; return; }
    const start = (currentKeychainsPage - 1) * perPage;
    const pageKeychains = allKeychains.slice(start, start + perPage);
    container.innerHTML = pageKeychains.map(k => {
        const originalPrice = k.price;
        const discount = getTotalDiscount('keychain');
        const discountedPrice = discount > 0 ? Math.floor(originalPrice * (1 - discount)) : originalPrice;
        const discountPercent = Math.floor(discount * 100);
        const discountHtml = discount > 0 ? `<span style="color:#00ff88; font-size:12px;"> (${discountPercent}% OFF! Was ₹${originalPrice})</span>` : '';
        if(k.sold) return `<div class="card"><img src="${k.image}" alt="${k.name}" onerror="this.src='images/placeholder.jpg'"><h3>${k.name}</h3><p>${k.description}</p><p><strong style="color:#ff4444;">₹${discountedPrice}</strong>${discountHtml}</p><p style="font-size:12px;">${k.deliveryIncluded ? '✓ Delivery included' : '+ delivery extra'}</p><div class="sold-badge">SOLD OUT</div></div>`;
        return `<div class="card"><img src="${k.image}" alt="${k.name}" onerror="this.src='images/placeholder.jpg'"><h3>${k.name}</h3><p>${k.description}</p><p><strong style="color:#00ff88;">₹${discountedPrice}</strong>${discountHtml}</p><p style="font-size:12px;">${k.deliveryIncluded ? '✓ Delivery included' : '+ delivery extra'}</p><div class="buttons"><button onclick="addWishlist('${k.name}')">❤️ Wishlist</button><button onclick="addCart('${k.name}', ${discountedPrice})">🛒 Cart</button><button onclick="showDeliveryForm('${k.name}', ${discountedPrice}, 'keychain', ${k.id})">💳 Buy Now</button></div></div>`;
    }).join('');
    updateKeychainsPagination();
}
function updateKeychainsPagination() {
    const paginationDiv = document.getElementById("keychainsPagination");
    if(!paginationDiv) return;
    const totalPages = Math.ceil(allKeychains.length / perPage);
    if(totalPages <= 1) { paginationDiv.innerHTML = ""; return; }
    let buttons = '<div class="pagination">';
    for(let i = 1; i <= totalPages; i++) buttons += `<button onclick="goToKeychainsPage(${i})" ${i === currentKeychainsPage ? 'style="background:#00d4ff;color:black;"' : ''}>${i}</button>`;
    buttons += '</div>';
    paginationDiv.innerHTML = buttons;
}
function goToKeychainsPage(page) { currentKeychainsPage = page; renderKeychains(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

function addWishlist(product) { 
    if(wishlist.includes(product)) { 
        alert(product + " is already in your wishlist!"); 
        return; 
    } 
    wishlist.push(product); 
    localStorage.setItem("wishlist", JSON.stringify(wishlist)); 
    updateCounters(); 
    alert("❤️ " + product + " added to wishlist!"); 
}

function addCart(product, price) { 
    cart.push({ product, price, date: new Date().toLocaleString() }); 
    localStorage.setItem("cart", JSON.stringify(cart)); 
    updateCounters(); 
    alert("🛒 " + product + " added to cart! (₹" + price + ")"); 
}

// ===========================
// ORDER & DELIVERY LOGIC
// ===========================
let currentOrderType = null, currentOrderId = null, currentOrderPrice = null, currentOrderName = null, currentCustomerEmail = null, currentReferenceImage = null;

function showDeliveryForm(product, price, type, id) {
    if(!currentCustomer) { alert("Please login/signup first to continue!"); showLoginPopup(); return; }
    currentOrderName = product; currentOrderPrice = price; currentOrderType = type; currentOrderId = Date.now();
    const deliveryPopup = document.getElementById("deliveryPopup");
    if(deliveryPopup) {
        deliveryPopup.style.display = "block";
        document.getElementById("deliveryName").value = currentCustomer.fullName || "";
        document.getElementById("deliveryEmail").value = currentCustomer.email || "";
        document.getElementById("deliveryCity").value = currentCustomer.city || "";
        document.getElementById("deliveryPincode").value = currentCustomer.pincode || "";
        document.getElementById("deliveryAddress").value = currentCustomer.address || "";
        document.getElementById("deliveryState").value = currentCustomer.state || "";
        document.getElementById("deliveryPhone").value = currentCustomer.phone || "";
    }
}

function submitDeliveryDetails() {
    const fullName = document.getElementById("deliveryName")?.value.trim() || "";
    const email = document.getElementById("deliveryEmail")?.value.trim() || "";
    const city = document.getElementById("deliveryCity")?.value.trim() || "";
    const pincode = document.getElementById("deliveryPincode")?.value.trim() || "";
    const address = document.getElementById("deliveryAddress")?.value.trim() || "";
    const state = document.getElementById("deliveryState")?.value.trim() || "";
    const phone = document.getElementById("deliveryPhone")?.value.trim() || "";
    if(!fullName || !email || !city || !pincode || !address || !state || !phone) { alert("❌ Please fill all fields."); return; }
    if(pincode.length !== 6) { alert("❌ Please enter a valid 6-digit pincode."); return; }
    if(phone.length < 10) { alert("❌ Please enter a valid 10-digit phone number."); return; }
    currentCustomerEmail = email;
    window.deliveryDetails = { fullName, email, city, pincode, address, state, phone };
    document.getElementById("deliveryPopup").style.display = "none";
    document.getElementById("paymentPopup").style.display = "block";
    document.getElementById("paymentScreenshot").value = "";
}

// Close popups
document.getElementById("closeDeliveryPopup")?.addEventListener("click", () => document.getElementById("deliveryPopup").style.display = "none");
document.getElementById("closePopup")?.addEventListener("click", () => document.getElementById("paymentPopup").style.display = "none");
window.addEventListener("click", (e) => { if(e.target === document.getElementById("deliveryPopup")) document.getElementById("deliveryPopup").style.display = "none"; if(e.target === document.getElementById("paymentPopup")) document.getElementById("paymentPopup").style.display = "none"; if(e.target === document.getElementById("loginPopup")) document.getElementById("loginPopup").style.display = "none"; });

// Commission price calculation
const sheetSize = document.getElementById("sheetSize");
const medium = document.getElementById("medium");
const commissionPriceEl = document.getElementById("commissionPrice");
function calculateCommission() {
    if(sheetSize && medium && commissionPriceEl) {
        const sizePrice = parseInt(sheetSize.value) || 0;
        const mediumPrice = parseInt(medium.value) || 0;
        let total = sizePrice + mediumPrice;
        const discount = getTotalDiscount('commission');
        if(discount > 0) total = Math.floor(total * (1 - discount));
        commissionPriceEl.innerText = "Total : ₹" + total;
    }
}
if(sheetSize && medium && commissionPriceEl) { sheetSize.addEventListener("change", calculateCommission); medium.addEventListener("change", calculateCommission); calculateCommission(); }

function compressImage(file, maxSizeKB = 100) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function() {
                let width = img.width, height = img.height, quality = 0.7;
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const maxDimension = 600;
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) { height = (height * maxDimension) / width; width = maxDimension; }
                    else { width = (width * maxDimension) / height; height = maxDimension; }
                }
                canvas.width = width; canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                let base64 = canvas.toDataURL('image/jpeg', quality);
                let sizeKB = Math.ceil((base64.length * 3) / 4 / 1024);
                while (sizeKB > maxSizeKB && quality > 0.1) { quality -= 0.1; base64 = canvas.toDataURL('image/jpeg', quality); sizeKB = Math.ceil((base64.length * 3) / 4 / 1024); }
                resolve(base64);
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

async function commissionOrder() {
    if(!currentCustomer) { alert("Please login/signup first to place a commission order!"); showLoginPopup(); return; }
    const referenceImage = document.getElementById('commissionReferenceImage')?.files[0];
    if(!referenceImage) { alert("❌ REFERENCE IMAGE IS MANDATORY! Please upload a reference image."); return; }
    let imageBase64 = "";
    try { imageBase64 = await compressImage(referenceImage, 100); } catch(error) { alert("Error processing image. Please try again."); return; }
    const sizePrice = parseInt(sheetSize?.value) || 0;
    const mediumPrice = parseInt(medium?.value) || 0;
    let total = sizePrice + mediumPrice;
    const discount = getTotalDiscount('commission');
    const discountPercent = Math.floor(discount * 100);
    if(discount > 0) total = Math.floor(total * (1 - discount));
    const sheetSizeText = sheetSize?.options[sheetSize.selectedIndex]?.text || "";
    const mediumText = medium?.options[medium.selectedIndex]?.text || "";
    currentOrderType = "commission";
    currentOrderName = `Commission: ${mediumText} on ${sheetSizeText}`;
    currentOrderPrice = total;
    currentOrderId = Date.now();
    currentReferenceImage = imageBase64;
    window.commissionDetails = { referenceImageName: referenceImage.name, sheetSizeText, mediumText, discountPercent, isMonthlyOffer: isMonthlyOfferDay() };
    const deliveryPopup = document.getElementById("deliveryPopup");
    if(deliveryPopup) {
        deliveryPopup.style.display = "block";
        document.getElementById("deliveryName").value = currentCustomer.fullName || "";
        document.getElementById("deliveryEmail").value = currentCustomer.email || "";
        document.getElementById("deliveryCity").value = currentCustomer.city || "";
        document.getElementById("deliveryPincode").value = currentCustomer.pincode || "";
        document.getElementById("deliveryAddress").value = currentCustomer.address || "";
        document.getElementById("deliveryState").value = currentCustomer.state || "";
        document.getElementById("deliveryPhone").value = currentCustomer.phone || "";
    }
}

// Helper function to convert dataURL to File
function dataURLToFile(dataURL, filename) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--) { u8arr[n] = bstr.charCodeAt(n); }
    return new File([u8arr], filename, { type: mime });
}

// ===========================
// FINAL ORDER SUBMISSION - AUTO SUBMIT TO GOOGLE FORM
// ===========================
const submitBtn = document.getElementById("submitPayment");
if(submitBtn) {
    submitBtn.textContent = "Confirm Order";
    submitBtn.addEventListener("click", async function() {
        const screenshot = document.getElementById("paymentScreenshot");
        if(!screenshot || screenshot.files.length === 0) { alert("📸 Please upload payment screenshot first."); return; }
        
        let paymentScreenshotBase64 = "";
        try { paymentScreenshotBase64 = await compressImage(screenshot.files[0], 100); } catch(error) { alert("Error processing payment screenshot. Please try again."); return; }
        
        // Save order to localStorage
        let allOrders = JSON.parse(localStorage.getItem("allOrders")) || [];
        allOrders.push({
            orderId: currentOrderId,
            orderType: currentOrderType,
            customer: window.deliveryDetails || currentCustomer,
            commissionDetails: window.commissionDetails,
            product: currentOrderName,
            amount: currentOrderPrice,
            date: new Date().toLocaleString(),
            paymentScreenshot: paymentScreenshotBase64,
            referenceImage: currentReferenceImage
        });
        localStorage.setItem("allOrders", JSON.stringify(allOrders));
        
        // Prepare form data for Google Form
        const formData = new FormData();
        
        formData.append(FORM_ENTRY_IDS.orderId, currentOrderId);
        formData.append(FORM_ENTRY_IDS.orderDate, new Date().toLocaleString());
        formData.append(FORM_ENTRY_IDS.fullName, window.deliveryDetails?.fullName || currentCustomer?.fullName || "");
        formData.append(FORM_ENTRY_IDS.email, window.deliveryDetails?.email || currentCustomer?.email || "");
        formData.append(FORM_ENTRY_IDS.phone, window.deliveryDetails?.phone || currentCustomer?.phone || "");
        formData.append(FORM_ENTRY_IDS.address, window.deliveryDetails?.address || currentCustomer?.address || "");
        formData.append(FORM_ENTRY_IDS.city, window.deliveryDetails?.city || currentCustomer?.city || "");
        formData.append(FORM_ENTRY_IDS.state, window.deliveryDetails?.state || currentCustomer?.state || "");
        formData.append(FORM_ENTRY_IDS.pincode, window.deliveryDetails?.pincode || currentCustomer?.pincode || "");
        formData.append(FORM_ENTRY_IDS.product, currentOrderName);
        formData.append(FORM_ENTRY_IDS.amount, currentOrderPrice);
        
        let orderTypeValue = "Product";
        if(currentOrderType === "commission") orderTypeValue = "Commission";
        else if(currentOrderType === "drawing") orderTypeValue = "Drawing";
        else if(currentOrderType === "keychain") orderTypeValue = "Keychain";
        formData.append(FORM_ENTRY_IDS.orderType, orderTypeValue);
        
        // Convert base64 back to file and append
        const paymentFile = dataURLToFile(paymentScreenshotBase64, "payment.jpg");
        formData.append(FORM_ENTRY_IDS.paymentScreenshot, paymentFile);
        
        if(currentReferenceImage) {
            const referenceFile = dataURLToFile(currentReferenceImage, "reference.jpg");
            formData.append(FORM_ENTRY_IDS.referenceImage, referenceFile);
        }
        
        // Submit to Google Form in background (no redirect)
        try {
            await fetch(GOOGLE_FORM_ACTION, { method: "POST", mode: "no-cors", body: formData });
            alert(`✅ ORDER CONFIRMED!\n\n📦 Order ID: ${currentOrderId}\n💰 Amount: ₹${currentOrderPrice}\n\n📧 Order details sent to Google Form.\n📁 Order saved in Admin Panel (Ctrl+Shift+A)`);
        } catch(error) {
            console.error("Error:", error);
            alert(`✅ ORDER CONFIRMED!\n\n📦 Order ID: ${currentOrderId}\n💰 Amount: ₹${currentOrderPrice}\n\n📁 Order saved in Admin Panel (Ctrl+Shift+A)`);
        }
        
        document.getElementById("paymentPopup").style.display = "none";
        if(currentOrderType === "commission") { document.getElementById("commissionForm")?.reset(); calculateCommission(); }
        if(currentOrderType === 'cart') { cart = []; localStorage.setItem("cart", JSON.stringify(cart)); updateCounters(); }
        
        currentOrderType = null; currentOrderId = null; currentOrderPrice = null; currentOrderName = null; currentCustomerEmail = null; currentReferenceImage = null; window.commissionDetails = null; window.deliveryDetails = null;
        if(screenshot) screenshot.value = "";
        
        if(currentCustomer) {
            currentCustomer.orderCount = (currentCustomer.orderCount || 0) + 1;
            currentCustomer.totalSpent = (currentCustomer.totalSpent || 0) + currentOrderPrice;
            const idx = customers.findIndex(c => c.email === currentCustomer.email);
            if(idx !== -1) customers[idx] = currentCustomer;
            localStorage.setItem("customers", JSON.stringify(customers));
            localStorage.setItem("currentCustomer", JSON.stringify(currentCustomer));
        }
    });
}

// ===========================
// ADMIN PANEL (Ctrl+Shift+A)
// ===========================
function showAdminPanel() {
    const allOrders = JSON.parse(localStorage.getItem("allOrders")) || [];
    const allCustomers = JSON.parse(localStorage.getItem("customers")) || [];
    let html = `<div id="adminPanelContainer" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:10000; overflow-y:auto; padding:20px;"><div style="background:white; color:black; max-width:900px; margin:20px auto; padding:20px; border-radius:10px;"><button onclick="closeAdminPanel()" style="float:right; background:red; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Close</button><h2>📊 Admin Dashboard</h2><p>Total Customers: ${allCustomers.length} | Total Orders: ${allOrders.length}</p><h3>📦 Recent Orders</h3><div style="max-height:400px; overflow-y:auto;">`;
    if(allOrders.length === 0) html += '<p>No orders yet.</p>';
    allOrders.slice().reverse().forEach(order => {
        html += `<div style="border:1px solid #ddd; margin:10px 0; padding:10px; border-radius:5px;"><p><strong>Order ID:</strong> ${order.orderId}</p><p><strong>Date:</strong> ${order.date}</p><p><strong>Customer:</strong> ${order.customer?.fullName} (${order.customer?.email})</p><p><strong>Phone:</strong> ${order.customer?.phone}</p><p><strong>Address:</strong> ${order.customer?.address}, ${order.customer?.city} - ${order.customer?.pincode}</p><p><strong>Product:</strong> ${order.product}</p><p><strong>Amount:</strong> ₹${order.amount}</p>${order.paymentScreenshot ? `<button onclick="viewImage('${order.paymentScreenshot}')" style="background:#00d4ff; border:none; padding:5px 10px; border-radius:5px; margin-right:5px;">View Payment</button>` : ''}${order.referenceImage ? `<button onclick="viewImage('${order.referenceImage}')" style="background:#ff0080; border:none; padding:5px 10px; border-radius:5px;">View Reference</button>` : ''}</div>`;
    });
    html += `</div><h3>👥 Customers</h3><div style="max-height:200px; overflow-y:auto;">`;
    allCustomers.forEach(cust => { html += `<div style="border:1px solid #ddd; margin:5px 0; padding:5px;"><p><strong>${cust.fullName}</strong> - ${cust.email}<br>Orders: ${cust.orderCount || 0} | Spent: ₹${cust.totalSpent || 0}</p></div>`; });
    html += `</div><p style="margin-top:20px; font-size:12px; color:#888;">💡 Click "View Payment" to see the screenshot.</p></div></div>`;
    document.body.insertAdjacentHTML('beforeend', html);
}
function closeAdminPanel() { document.getElementById("adminPanelContainer")?.remove(); }
function viewImage(base64) { const w = window.open(); w.document.write(`<html><body style="display:flex; justify-content:center; align-items:center; min-height:100vh; background:#000;"><img src="${base64}" style="max-width:100%; max-height:100vh;"></body></html>`); }
document.addEventListener('keydown', e => { if(e.ctrlKey && e.shiftKey && e.key === 'A') showAdminPanel(); });

// ===========================
// HOMEPAGE & INIT
// ===========================
async function loadHomeProducts() {
    try {
        const drawingsRes = await fetch('data/drawings.json');
        const drawings = await drawingsRes.json();
        const first6Drawings = drawings.slice(0, 6);
        const drawingsGrid = document.getElementById('homeDrawingsGrid');
        if(drawingsGrid) {
            drawingsGrid.innerHTML = first6Drawings.map(d => {
                const originalPrice = d.price + d.delivery;
                const discount = getTotalDiscount('drawing');
                const discountedPrice = discount > 0 ? Math.floor(originalPrice * (1 - discount)) : originalPrice;
                const discountPercent = Math.floor(discount * 100);
                const discountHtml = discount > 0 ? `<span style="color:#00ff88;"> (${discountPercent}% OFF)</span>` : '';
                if(d.sold) return `<div class="card"><img src="${d.image}" alt="${d.name}" onerror="this.src='images/placeholder.jpg'"><h3>${d.name}</h3><p>${d.description}</p><p><strong>₹${discountedPrice}</strong>${discountHtml}</p><div class="sold-badge">SOLD OUT</div></div>`;
                return `<div class="card"><img src="${d.image}" alt="${d.name}" onerror="this.src='images/placeholder.jpg'"><h3>${d.name}</h3><p>${d.description}</p><p><strong>₹${discountedPrice}</strong>${discountHtml}</p><div class="buttons" style="padding:10px;"><button onclick="addWishlist('${d.name.replace(/'/g, "\\'")}')" style="padding:8px; font-size:12px;">❤️ Wishlist</button><button onclick="addCart('${d.name.replace(/'/g, "\\'")}', ${discountedPrice})" style="padding:8px; font-size:12px;">🛒 Cart</button><button onclick="showDeliveryForm('${d.name.replace(/'/g, "\\'")}', ${discountedPrice}, 'drawing', ${d.id})" style="padding:8px; font-size:12px;">💳 Buy Now</button></div></div>`;
            }).join('');
        }
        const keychainsRes = await fetch('data/keychains.json');
        const keychains = await keychainsRes.json();
        const first6Keychains = keychains.slice(0, 6);
        const keychainsGrid = document.getElementById('homeKeychainsGrid');
        if(keychainsGrid) {
            keychainsGrid.innerHTML = first6Keychains.map(k => {
                const originalPrice = k.price;
                const discount = getTotalDiscount('keychain');
                const discountedPrice = discount > 0 ? Math.floor(originalPrice * (1 - discount)) : originalPrice;
                const discountPercent = Math.floor(discount * 100);
                const discountHtml = discount > 0 ? `<span style="color:#00ff88;"> (${discountPercent}% OFF)</span>` : '';
                if(k.sold) return `<div class="card"><img src="${k.image}" alt="${k.name}" onerror="this.src='images/placeholder.jpg'"><h3>${k.name}</h3><p>${k.description}</p><p><strong>₹${discountedPrice}</strong>${discountHtml}</p><div class="sold-badge">SOLD OUT</div></div>`;
                return `<div class="card"><img src="${k.image}" alt="${k.name}" onerror="this.src='images/placeholder.jpg'"><h3>${k.name}</h3><p>${k.description}</p><p><strong>₹${discountedPrice}</strong>${discountHtml}</p><div class="buttons" style="padding:10px;"><button onclick="addWishlist('${k.name.replace(/'/g, "\\'")}')" style="padding:8px; font-size:12px;">❤️ Wishlist</button><button onclick="addCart('${k.name.replace(/'/g, "\\'")}', ${discountedPrice})" style="padding:8px; font-size:12px;">🛒 Cart</button><button onclick="showDeliveryForm('${k.name.replace(/'/g, "\\'")}', ${discountedPrice}, 'keychain', ${k.id})" style="padding:8px; font-size:12px;">💳 Buy Now</button></div></div>`;
            }).join('');
        }
    } catch(e) { console.error("Error loading home products:", e); }
}
function updateOfferBanner() {
    const isFirstDay = isMonthlyOfferDay();
    document.querySelectorAll('#offerBannerText').forEach(span => { if(span) span.innerHTML = isFirstDay ? "🎉 MONTHLY OFFER: 10% OFF ON EVERYTHING TODAY ONLY! (1st Day Special) 🎉" : "✨ FIRST 20 CUSTOMERS GET 20% OFF | FIRST 10 COMMISSIONS GET 40% OFF ✨"; });
}
// Floating art rotation
const floatContainer = document.getElementById("floatingContainer");
let rotation = 0, touchStartY = 0, touchEndY = 0;
document.addEventListener("touchstart", e => { touchStartY = e.changedTouches[0].screenY; });
document.addEventListener("touchend", e => { touchEndY = e.changedTouches[0].screenY; if(floatContainer) { if(touchStartY - touchEndY > 50) rotation += 30; else if(touchEndY - touchStartY > 50) rotation -= 30; floatContainer.style.transform = `rotate(${rotation}deg)`; } });
window.addEventListener("wheel", e => { if(floatContainer) { rotation += e.deltaY < 0 ? 15 : -15; floatContainer.style.transform = `rotate(${rotation}deg)`; } });
window.addEventListener("beforeunload", () => { localStorage.setItem("cart", JSON.stringify(cart)); localStorage.setItem("wishlist", JSON.stringify(wishlist)); });
document.addEventListener("DOMContentLoaded", () => {
    if(document.getElementById("drawingsContainer")) loadDrawings();
    if(document.getElementById("keychainsContainer")) loadKeychains();
    if(document.getElementById("homeDrawingsGrid")) loadHomeProducts();
    updateOfferBanner(); updateCustomerDisplay();
    const video = document.getElementById("bgVideo"); if(video) { video.muted = true; video.play().catch(e => console.log("Video autoplay blocked:", e)); }
});
