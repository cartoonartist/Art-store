// ===========================
// CART & WISHLIST STORAGE
// ===========================

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

updateCounters();

// ===========================
// ADMIN CONFIGURATION
// ===========================
const ADMIN_EMAIL = "cartoonartist10m@gmail.com";

// ===========================
// CUSTOMER DATA STORAGE
// ===========================
let customers = JSON.parse(localStorage.getItem("customers")) || [];
let currentCustomer = JSON.parse(localStorage.getItem("currentCustomer")) || null;

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
    if(productType === 'drawing') {
        totalDiscount += getDrawingDiscount();
    } else if(productType === 'keychain') {
        totalDiscount += getKeychainDiscount();
    } else if(productType === 'commission') {
        totalDiscount += getCommissionDiscount();
    }
    return Math.min(totalDiscount, 0.50);
}

function markDrawingBuyer(email) {
    if(email && !drawingBuyers.includes(email) && drawingBuyers.length < 20) {
        drawingBuyers.push(email);
        localStorage.setItem("drawingBuyers", JSON.stringify(drawingBuyers));
    }
}

function markKeychainBuyer(email) {
    if(email && !keychainBuyers.includes(email) && keychainBuyers.length < 20) {
        keychainBuyers.push(email);
        localStorage.setItem("keychainBuyers", JSON.stringify(keychainBuyers));
    }
}

function markCommissionBuyer(email) {
    if(email && !commissionBuyers.includes(email) && commissionBuyers.length < 10) {
        commissionBuyers.push(email);
        localStorage.setItem("commissionBuyers", JSON.stringify(commissionBuyers));
    }
}

// ===========================
// UPDATE COUNTERS
// ===========================
function updateCounters() {
    const cartCount = document.getElementById("cartCount");
    const wishlistCount = document.getElementById("wishlistCount");
    if(cartCount) cartCount.innerText = cart.length;
    if(wishlistCount) wishlistCount.innerText = wishlist.length;
}

// ===========================
// LOGIN / SIGNUP FUNCTIONS
// ===========================
function showLoginPopup() {
    const loginPopup = document.getElementById("loginPopup");
    if(loginPopup) loginPopup.style.display = "block";
}

function closeLoginPopup() {
    const loginPopup = document.getElementById("loginPopup");
    if(loginPopup) loginPopup.style.display = "none";
}

function loginCustomer() {
    const email = document.getElementById("loginEmail")?.value.trim() || "";
    if(!email) {
        alert("Please enter your email address");
        return;
    }
    
    // Find existing customer
    let customer = customers.find(c => c.email === email);
    
    if(!customer) {
        // New customer - ask for details
        const fullName = prompt("Welcome! Please enter your full name:");
        const phone = prompt("Please enter your phone number:");
        const address = prompt("Please enter your complete address:");
        const city = prompt("Please enter your city:");
        const state = prompt("Please enter your state:");
        const pincode = prompt("Please enter your pincode (6 digits):");
        
        if(!fullName || !phone || !address || !city || !state || !pincode) {
            alert("All fields are required!");
            return;
        }
        
        customer = {
            email: email,
            fullName: fullName,
            phone: phone,
            address: address,
            city: city,
            state: state,
            pincode: pincode,
            orderCount: 0,
            totalSpent: 0,
            joinDate: new Date().toLocaleString()
        };
        
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

function logoutCustomer() {
    currentCustomer = null;
    localStorage.removeItem("currentCustomer");
    updateCustomerDisplay();
    alert("Logged out successfully");
}

function updateCustomerDisplay() {
    const customerInfo = document.getElementById("customerInfo");
    if(customerInfo) {
        if(currentCustomer) {
            customerInfo.innerHTML = `
                <div style="background:#00d4ff; color:black; padding:5px 10px; border-radius:20px;">
                    👤 ${currentCustomer.fullName}
                    <button onclick="logoutCustomer()" style="margin-left:10px; background:red; color:white; border:none; border-radius:10px; padding:2px 8px;">Logout</button>
                </div>
            `;
        } else {
            customerInfo.innerHTML = `<button onclick="showLoginPopup()" style="background:#00d4ff; color:black; border:none; border-radius:20px; padding:5px 15px;">Login / Signup</button>`;
        }
    }
}

function getSavedAddress() {
    if(currentCustomer) {
        return {
            fullName: currentCustomer.fullName,
            email: currentCustomer.email,
            phone: currentCustomer.phone,
            address: currentCustomer.address,
            city: currentCustomer.city,
            state: currentCustomer.state,
            pincode: currentCustomer.pincode
        };
    }
    return null;
}

// ===========================
// LOAD DRAWINGS FROM JSON
// ===========================
let currentDrawingsPage = 1;
const drawingsPerPage = 6;
let allDrawings = [];

async function loadDrawings() {
    try {
        const response = await fetch('data/drawings.json');
        allDrawings = await response.json();
        renderDrawings();
    } catch(error) {
        console.error("Error loading drawings:", error);
        const container = document.getElementById("drawingsContainer");
        if(container) container.innerHTML = "<p style='text-align:center;color:red;'>Error loading drawings.</p>";
    }
}

function renderDrawings() {
    const container = document.getElementById("drawingsContainer");
    if(!container) return;
    
    if(allDrawings.length === 0) {
        container.innerHTML = "<p style='text-align:center;'>No drawings available.</p>";
        return;
    }
    
    const start = (currentDrawingsPage - 1) * drawingsPerPage;
    const end = start + drawingsPerPage;
    const pageDrawings = allDrawings.slice(start, end);
    
    container.innerHTML = pageDrawings.map(drawing => {
        const originalPrice = drawing.price + drawing.delivery;
        const discount = getTotalDiscount('drawing');
        const discountedPrice = discount > 0 ? Math.floor(originalPrice * (1 - discount)) : originalPrice;
        const discountPercent = Math.floor(discount * 100);
        const discountHtml = discount > 0 ? `<span style="color:#00ff88; font-size:12px;"> (${discountPercent}% OFF! Was ₹${originalPrice})</span>` : '';
        
        if(drawing.sold) {
            return `
            <div class="card">
                <img src="${drawing.image}" alt="${drawing.name}" onerror="this.src='images/placeholder.jpg'">
                <h3>${drawing.name}</h3>
                <p>${drawing.description}</p>
                <p>Size: ${drawing.size} | Paper: ${drawing.paper}</p>
                <p><strong style="color:#ff4444;">₹${discountedPrice}</strong>${discountHtml}</p>
                <div class="sold-badge">SOLD OUT</div>
            </div>`;
        }
        
        return `
        <div class="card">
            <img src="${drawing.image}" alt="${drawing.name}" onerror="this.src='images/placeholder.jpg'">
            <h3>${drawing.name}</h3>
            <p>${drawing.description}</p>
            <p>Size: ${drawing.size} | Paper: ${drawing.paper}</p>
            <p><strong style="color:#00ff88;">₹${discountedPrice}</strong>${discountHtml}</p>
            <div class="buttons">
                <button onclick="addWishlist('${drawing.name}')">❤️ Wishlist</button>
                <button onclick="addCart('${drawing.name}', ${discountedPrice})">🛒 Cart</button>
                <button onclick="showDeliveryForm('${drawing.name}', ${discountedPrice}, 'drawing', ${drawing.id})">💳 Buy Now</button>
            </div>
        </div>`;
    }).join('');
    
    updateDrawingsPagination();
}

function updateDrawingsPagination() {
    const paginationDiv = document.getElementById("drawingsPagination");
    if(!paginationDiv) return;
    
    const totalPages = Math.ceil(allDrawings.length / drawingsPerPage);
    if(totalPages <= 1) {
        paginationDiv.innerHTML = "";
        return;
    }
    
    let buttons = '<div class="pagination">';
    for(let i = 1; i <= totalPages; i++) {
        buttons += `<button onclick="goToDrawingsPage(${i})" ${i === currentDrawingsPage ? 'style="background:#00d4ff;color:black;"' : ''}>${i}</button>`;
    }
    buttons += '</div>';
    paginationDiv.innerHTML = buttons;
}

function goToDrawingsPage(page) {
    currentDrawingsPage = page;
    renderDrawings();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===========================
// LOAD KEYCHAINS FROM JSON
// ===========================
let currentKeychainsPage = 1;
const keychainsPerPage = 6;
let allKeychains = [];

async function loadKeychains() {
    try {
        const response = await fetch('data/keychains.json');
        allKeychains = await response.json();
        renderKeychains();
    } catch(error) {
        console.error("Error loading keychains:", error);
        const container = document.getElementById("keychainsContainer");
        if(container) container.innerHTML = "<p style='text-align:center;color:red;'>Error loading keychains.</p>";
    }
}

function renderKeychains() {
    const container = document.getElementById("keychainsContainer");
    if(!container) return;
    
    if(allKeychains.length === 0) {
        container.innerHTML = "<p style='text-align:center;'>No keychains available.</p>";
        return;
    }
    
    const start = (currentKeychainsPage - 1) * keychainsPerPage;
    const end = start + keychainsPerPage;
    const pageKeychains = allKeychains.slice(start, end);
    
    container.innerHTML = pageKeychains.map(keychain => {
        const originalPrice = keychain.price;
        const discount = getTotalDiscount('keychain');
        const discountedPrice = discount > 0 ? Math.floor(originalPrice * (1 - discount)) : originalPrice;
        const discountPercent = Math.floor(discount * 100);
        const discountHtml = discount > 0 ? `<span style="color:#00ff88; font-size:12px;"> (${discountPercent}% OFF! Was ₹${originalPrice})</span>` : '';
        
        if(keychain.sold) {
            return `
            <div class="card">
                <img src="${keychain.image}" alt="${keychain.name}" onerror="this.src='images/placeholder.jpg'">
                <h3>${keychain.name}</h3>
                <p>${keychain.description}</p>
                <p><strong style="color:#ff4444;">₹${discountedPrice}</strong>${discountHtml}</p>
                <p style="font-size:12px;">${keychain.deliveryIncluded ? '✓ Delivery included' : '+ delivery extra'}</p>
                <div class="sold-badge">SOLD OUT</div>
            </div>`;
        }
        
        return `
        <div class="card">
            <img src="${keychain.image}" alt="${keychain.name}" onerror="this.src='images/placeholder.jpg'">
            <h3>${keychain.name}</h3>
            <p>${keychain.description}</p>
            <p><strong style="color:#00ff88;">₹${discountedPrice}</strong>${discountHtml}</p>
            <p style="font-size:12px;">${keychain.deliveryIncluded ? '✓ Delivery included' : '+ delivery extra'}</p>
            <div class="buttons">
                <button onclick="addWishlist('${keychain.name}')">❤️ Wishlist</button>
                <button onclick="addCart('${keychain.name}', ${discountedPrice})">🛒 Cart</button>
                <button onclick="showDeliveryForm('${keychain.name}', ${discountedPrice}, 'keychain', ${keychain.id})">💳 Buy Now</button>
            </div>
        </div>`;
    }).join('');
    
    updateKeychainsPagination();
}

function updateKeychainsPagination() {
    const paginationDiv = document.getElementById("keychainsPagination");
    if(!paginationDiv) return;
    
    const totalPages = Math.ceil(allKeychains.length / keychainsPerPage);
    if(totalPages <= 1) {
        paginationDiv.innerHTML = "";
        return;
    }
    
    let buttons = '<div class="pagination">';
    for(let i = 1; i <= totalPages; i++) {
        buttons += `<button onclick="goToKeychainsPage(${i})" ${i === currentKeychainsPage ? 'style="background:#00d4ff;color:black;"' : ''}>${i}</button>`;
    }
    buttons += '</div>';
    paginationDiv.innerHTML = buttons;
}

function goToKeychainsPage(page) {
    currentKeychainsPage = page;
    renderKeychains();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===========================
// WISHLIST & CART FUNCTIONS
// ===========================
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
// DELIVERY FORM POPUP (Now uses saved address if logged in)
// ===========================
let currentOrderType = null;
let currentOrderId = null;
let currentOrderPrice = null;
let currentOrderName = null;
let currentCustomerEmail = null;
let currentReferenceImage = null;

function showDeliveryForm(product, price, type, id) {
    // Check if customer is logged in
    if(!currentCustomer) {
        alert("Please login/signup first to continue with your order!");
        showLoginPopup();
        return;
    }
    
    currentOrderName = product;
    currentOrderPrice = price;
    currentOrderType = type;
    currentOrderId = id;
    
    const deliveryPopup = document.getElementById("deliveryPopup");
    if(deliveryPopup) {
        deliveryPopup.style.display = "block";
        
        // Auto-fill saved address if logged in
        if(currentCustomer) {
            document.getElementById("deliveryName").value = currentCustomer.fullName || "";
            document.getElementById("deliveryEmail").value = currentCustomer.email || "";
            document.getElementById("deliveryCity").value = currentCustomer.city || "";
            document.getElementById("deliveryPincode").value = currentCustomer.pincode || "";
            document.getElementById("deliveryAddress").value = currentCustomer.address || "";
            document.getElementById("deliveryState").value = currentCustomer.state || "";
            document.getElementById("deliveryPhone").value = currentCustomer.phone || "";
        } else {
            document.getElementById("deliveryName").value = "";
            document.getElementById("deliveryEmail").value = "";
            document.getElementById("deliveryCity").value = "";
            document.getElementById("deliveryPincode").value = "";
            document.getElementById("deliveryAddress").value = "";
            document.getElementById("deliveryState").value = "";
            document.getElementById("deliveryPhone").value = "";
        }
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
    
    if(!fullName) { alert("❌ Please enter your full name."); return; }
    if(!email) { alert("❌ Please enter your email address."); return; }
    if(!city) { alert("❌ Please enter your city."); return; }
    if(!pincode) { alert("❌ Please enter your pincode."); return; }
    if(pincode.length !== 6) { alert("❌ Please enter a valid 6-digit pincode."); return; }
    if(!address) { alert("❌ Please enter your complete address."); return; }
    if(!state) { alert("❌ Please enter your state."); return; }
    if(!phone) { alert("❌ Please enter your phone number."); return; }
    if(phone.length < 10) { alert("❌ Please enter a valid 10-digit phone number."); return; }
    
    currentCustomerEmail = email;
    window.deliveryDetails = { fullName, email, city, pincode, address, state, phone };
    
    document.getElementById("deliveryPopup").style.display = "none";
    
    const paymentPopup = document.getElementById("paymentPopup");
    if(paymentPopup) {
        paymentPopup.style.display = "block";
        document.getElementById("paymentScreenshot").value = "";
    }
}

// ===========================
// CLOSE POPUPS
// ===========================
const closeDeliveryBtn = document.getElementById("closeDeliveryPopup");
if(closeDeliveryBtn) {
    closeDeliveryBtn.addEventListener("click", () => {
        document.getElementById("deliveryPopup").style.display = "none";
    });
}

const closePopupBtn = document.getElementById("closePopup");
if(closePopupBtn) {
    closePopupBtn.addEventListener("click", () => {
        document.getElementById("paymentPopup").style.display = "none";
    });
}

window.addEventListener("click", (e) => {
    const deliveryPopup = document.getElementById("deliveryPopup");
    const paymentPopup = document.getElementById("paymentPopup");
    const loginPopup = document.getElementById("loginPopup");
    if(e.target === deliveryPopup) deliveryPopup.style.display = "none";
    if(e.target === paymentPopup) paymentPopup.style.display = "none";
    if(e.target === loginPopup) loginPopup.style.display = "none";
});

// ===========================
// COMMISSION PRICE CALCULATION
// ===========================
const sheetSize = document.getElementById("sheetSize");
const medium = document.getElementById("medium");
const commissionPrice = document.getElementById("commissionPrice");

function calculateCommission() {
    if(sheetSize && medium && commissionPrice) {
        const sizePrice = parseInt(sheetSize.value) || 0;
        const mediumPrice = parseInt(medium.value) || 0;
        let total = sizePrice + mediumPrice;
        const discount = getTotalDiscount('commission');
        if(discount > 0) {
            total = Math.floor(total * (1 - discount));
        }
        commissionPrice.innerText = "Total : ₹" + total;
    }
}

if(sheetSize && medium && commissionPrice) {
    sheetSize.addEventListener("change", calculateCommission);
    medium.addEventListener("change", calculateCommission);
    calculateCommission();
}

// ===========================
// COMPRESS IMAGE FUNCTION
// ===========================
function compressImage(file, maxSizeKB = 100) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function() {
                let width = img.width;
                let height = img.height;
                let quality = 0.7;
                
                const canvas = document.createElement('canvas');
                let ctx = canvas.getContext('2d');
                
                const maxDimension = 800;
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = (height * maxDimension) / width;
                        width = maxDimension;
                    } else {
                        width = (width * maxDimension) / height;
                        height = maxDimension;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                let base64 = canvas.toDataURL('image/jpeg', quality);
                let sizeKB = Math.ceil((base64.length * 3) / 4 / 1024);
                
                while (sizeKB > maxSizeKB && quality > 0.1) {
                    quality -= 0.1;
                    base64 = canvas.toDataURL('image/jpeg', quality);
                    sizeKB = Math.ceil((base64.length * 3) / 4 / 1024);
                }
                
                resolve(base64);
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

// ===========================
// COMMISSION ORDER
// ===========================
async function commissionOrder() {
    if(!currentCustomer) {
        alert("Please login/signup first to place a commission order!");
        showLoginPopup();
        return;
    }
    
    const referenceImage = document.getElementById('commissionReferenceImage')?.files[0];
    
    if(!referenceImage) { alert("❌ REFERENCE IMAGE IS MANDATORY! Please upload a reference image."); return; }
    
    let imageBase64 = "";
    try {
        imageBase64 = await compressImage(referenceImage, 100);
    } catch(error) {
        alert("Error processing image. Please try again.");
        return;
    }
    
    const sizePrice = parseInt(sheetSize?.value) || 0;
    const mediumPrice = parseInt(medium?.value) || 0;
    let total = sizePrice + mediumPrice;
    const discount = getTotalDiscount('commission');
    const discountPercent = Math.floor(discount * 100);
    if(discount > 0) total = Math.floor(total * (1 - discount));
    
    const sheetSizeText = sheetSize?.options[sheetSize.selectedIndex]?.text || "";
    const mediumText = medium?.options[medium.selectedIndex]?.text || "";
    
    currentCustomerEmail = currentCustomer.email;
    currentOrderType = "commission";
    currentOrderName = `Commission: ${mediumText} on ${sheetSizeText}`;
    currentOrderPrice = total;
    currentOrderId = Date.now();
    currentReferenceImage = imageBase64;
    
    window.commissionDetails = {
        fullName: currentCustomer.fullName,
        address: currentCustomer.address,
        city: currentCustomer.city,
        pincode: currentCustomer.pincode,
        phone: currentCustomer.phone,
        email: currentCustomer.email,
        referenceImageName: referenceImage.name,
        sheetSizeText, mediumText, discountPercent, isMonthlyOffer: isMonthlyOfferDay()
    };
    
    const popup = document.getElementById("paymentPopup");
    if(popup) {
        popup.style.display = "block";
        document.getElementById("paymentScreenshot").value = "";
    }
}

// ===========================
// SUBMIT PAYMENT - WITH EMAIL TO ADMIN
// ===========================
const submitPaymentBtn = document.getElementById("submitPayment");
if(submitPaymentBtn) {
    submitPaymentBtn.addEventListener("click", async function() {
        const screenshot = document.getElementById("paymentScreenshot");
        
        if(!screenshot || screenshot.files.length === 0) {
            alert("📸 Please upload payment screenshot first.");
            return;
        }
        
        let paymentScreenshotBase64 = "";
        try {
            paymentScreenshotBase64 = await compressImage(screenshot.files[0], 100);
        } catch(error) {
            alert("Error processing image. Please try again.");
            return;
        }
        
        let emailSubject = "";
        let emailHTML = "";
        
        if(currentOrderType === "commission") {
            emailSubject = `🎨 NEW COMMISSION ORDER - ${currentOrderId}`;
            emailHTML = `
<!DOCTYPE html>
<html>
<head><style>body{font-family:Arial}.container{max-width:600px;margin:0 auto;padding:20px}h2{color:#ff0080}.section{background:#f5f5f5;padding:15px;border-radius:10px;margin:15px 0}.image-box{border:2px dashed #00d4ff;padding:15px;text-align:center;margin:15px 0}img{max-width:100%;border-radius:8px}</style></head>
<body>
<div class="container">
    <h2>🎨 NEW COMMISSION ORDER!</h2>
    <div class="section">
        <p><strong>Order ID:</strong> ${currentOrderId}</p>
        <p><strong>Order Date:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Customer Email:</strong> ${currentCustomer?.email || "N/A"}</p>
    </div>
    <div class="section">
        <h3>👤 CUSTOMER DETAILS</h3>
        <p><strong>Name:</strong> ${window.commissionDetails?.fullName || "N/A"}</p>
        <p><strong>Email:</strong> ${window.commissionDetails?.email || "N/A"}</p>
        <p><strong>Phone:</strong> ${window.commissionDetails?.phone || "N/A"}</p>
        <p><strong>Address:</strong> ${window.commissionDetails?.address || "N/A"}</p>
        <p><strong>City:</strong> ${window.commissionDetails?.city || "N/A"}</p>
        <p><strong>Pincode:</strong> ${window.commissionDetails?.pincode || "N/A"}</p>
    </div>
    <div class="section">
        <h3>🎨 COMMISSION DETAILS</h3>
        <p><strong>Size:</strong> ${window.commissionDetails?.sheetSizeText || "N/A"}</p>
        <p><strong>Medium:</strong> ${window.commissionDetails?.mediumText || "N/A"}</p>
        <p><strong>Total Price:</strong> ₹${currentOrderPrice}</p>
    </div>
    <div class="image-box"><h3>📷 PAYMENT SCREENSHOT</h3><img src="${paymentScreenshotBase64}"></div>
    <div class="image-box"><h3>🖼️ REFERENCE IMAGE</h3><img src="${currentReferenceImage}"></div>
</div>
</body>
</html>
            `;
            markCommissionBuyer(window.commissionDetails?.email);
        } else {
            const discount = getTotalDiscount(currentOrderType);
            const discountPercent = Math.floor(discount * 100);
            emailSubject = `🛍️ NEW PRODUCT ORDER - ${currentOrderId}`;
            emailHTML = `
<!DOCTYPE html>
<html>
<head><style>body{font-family:Arial}.container{max-width:600px;margin:0 auto;padding:20px}h2{color:#ff0080}.section{background:#f5f5f5;padding:15px;border-radius:10px;margin:15px 0}.image-box{border:2px dashed #00d4ff;padding:15px;text-align:center;margin:15px 0}img{max-width:100%;border-radius:8px}</style></head>
<body>
<div class="container">
    <h2>🛍️ NEW PRODUCT ORDER!</h2>
    <div class="section">
        <p><strong>Order ID:</strong> ${currentOrderId}</p>
        <p><strong>Order Date:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Customer Email:</strong> ${currentCustomer?.email || "N/A"}</p>
    </div>
    <div class="section">
        <h3>👤 CUSTOMER DETAILS</h3>
        <p><strong>Name:</strong> ${window.deliveryDetails?.fullName || "N/A"}</p>
        <p><strong>Email:</strong> ${window.deliveryDetails?.email || "N/A"}</p>
        <p><strong>Phone:</strong> ${window.deliveryDetails?.phone || "N/A"}</p>
        <p><strong>Address:</strong> ${window.deliveryDetails?.address || "N/A"}</p>
        <p><strong>City:</strong> ${window.deliveryDetails?.city || "N/A"}</p>
        <p><strong>State:</strong> ${window.deliveryDetails?.state || "N/A"}</p>
        <p><strong>Pincode:</strong> ${window.deliveryDetails?.pincode || "N/A"}</p>
    </div>
    <div class="section">
        <h3>📦 PRODUCT DETAILS</h3>
        <p><strong>Type:</strong> ${currentOrderType?.toUpperCase() || "PRODUCT"}</p>
        <p><strong>Name:</strong> ${currentOrderName}</p>
        <p><strong>Total Price:</strong> ₹${currentOrderPrice}</p>
        <p><strong>Discount:</strong> ${discountPercent}% OFF</p>
    </div>
    <div class="image-box"><h3>📷 PAYMENT SCREENSHOT</h3><img src="${paymentScreenshotBase64}"></div>
</div>
</body>
</html>
            `;
            if(currentOrderType === 'drawing') {
                markDrawingBuyer(window.deliveryDetails?.email);
            } else if(currentOrderType === 'keychain') {
                markKeychainBuyer(window.deliveryDetails?.email);
            }
        }
        
        // Save order to localStorage
        let allOrders = JSON.parse(localStorage.getItem("allOrders")) || [];
        allOrders.push({
            orderId: currentOrderId,
            orderType: currentOrderType,
            customerEmail: currentCustomer?.email,
            customerName: window.deliveryDetails?.fullName || window.commissionDetails?.fullName,
            product: currentOrderName,
            amount: currentOrderPrice,
            date: new Date().toLocaleString(),
            paymentScreenshot: paymentScreenshotBase64,
            referenceImage: currentReferenceImage || null
        });
        localStorage.setItem("allOrders", JSON.stringify(allOrders));
        
        // Send email using FormSubmit
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://formsubmit.co/' + ADMIN_EMAIL;
        form.target = '_blank';
        form.style.display = 'none';
        
        const subjectInput = document.createElement('input');
        subjectInput.type = 'hidden';
        subjectInput.name = '_subject';
        subjectInput.value = emailSubject;
        form.appendChild(subjectInput);
        
        const htmlInput = document.createElement('input');
        htmlInput.type = 'hidden';
        htmlInput.name = 'html';
        htmlInput.value = emailHTML;
        form.appendChild(htmlInput);
        
        const redirectInput = document.createElement('input');
        redirectInput.type = 'hidden';
        redirectInput.name = '_next';
        redirectInput.value = window.location.href;
        form.appendChild(redirectInput);
        
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        
        alert(`✅ ORDER SUBMITTED!\n\n📧 Order sent to Admin email!\n📦 Order ID: ${currentOrderId}\n💰 Amount: ₹${currentOrderPrice}\n\nWe will contact you within 24 hours!`);
        
        document.getElementById("paymentPopup").style.display = "none";
        
        if(currentOrderType === "commission") {
            const formElement = document.getElementById("commissionForm");
            if(formElement) formElement.reset();
            calculateCommission();
        }
        
        currentOrderType = null;
        currentOrderId = null;
        currentOrderPrice = null;
        currentOrderName = null;
        currentCustomerEmail = null;
        currentReferenceImage = null;
        window.commissionDetails = null;
        window.deliveryDetails = null;
        
        if(screenshot) screenshot.value = "";
        
        // Update customer stats
        if(currentCustomer) {
            currentCustomer.orderCount = (currentCustomer.orderCount || 0) + 1;
            currentCustomer.totalSpent = (currentCustomer.totalSpent || 0) + currentOrderPrice;
            const index = customers.findIndex(c => c.email === currentCustomer.email);
            if(index !== -1) customers[index] = currentCustomer;
            localStorage.setItem("customers", JSON.stringify(customers));
            localStorage.setItem("currentCustomer", JSON.stringify(currentCustomer));
        }
    });
}

// ===========================
// ADMIN PANEL FUNCTIONS
// ===========================
function showAdminPanel() {
    // Check if logged in as admin
    if(!currentCustomer || currentCustomer.email !== ADMIN_EMAIL) {
        alert("⚠️ Admin access only. Please login with admin email: " + ADMIN_EMAIL);
        showLoginPopup();
        return;
    }
    
    const allOrders = JSON.parse(localStorage.getItem("allOrders")) || [];
    const allCustomers = JSON.parse(localStorage.getItem("customers")) || [];
    
    let html = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:10000; overflow-y:auto; padding:20px;">
            <div style="background:white; color:black; max-width:800px; margin:20px auto; padding:20px; border-radius:10px;">
                <button onclick="closeAdminPanel()" style="float:right; background:red; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Close</button>
                <h2>📊 Admin Dashboard</h2>
                <p>Welcome, ${currentCustomer.fullName} | Total Customers: ${allCustomers.length} | Total Orders: ${allOrders.length}</p>
                
                <h3>📦 Recent Orders (${allOrders.length})</h3>
                <div style="max-height:400px; overflow-y:auto;">
    `;
    
    if(allOrders.length === 0) {
        html += '<p>No orders yet.</p>';
    }
    
    allOrders.slice().reverse().forEach(order => {
        html += `
            <div style="border:1px solid #ddd; margin:10px 0; padding:10px; border-radius:5px;">
                <p><strong>Order ID:</strong> ${order.orderId}</p>
                <p><strong>Date:</strong> ${order.date}</p>
                <p><strong>Customer:</strong> ${order.customerName} (${order.customerEmail})</p>
                <p><strong>Product:</strong> ${order.product}</p>
                <p><strong>Amount:</strong> ₹${order.amount}</p>
                <button onclick="viewOrderImage('${order.orderId}')" style="background:#00d4ff; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">View Payment Screenshot</button>
                ${order.referenceImage ? `<button onclick="viewReferenceImage('${order.orderId}')" style="background:#ff0080; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; margin-left:5px;">View Reference Image</button>` : ''}
            </div>
        `;
    });
    
    html += `
                </div>
                <h3>👥 All Customers (${allCustomers.length})</h3>
                <div style="max-height:300px; overflow-y:auto;">
    `;
    
    allCustomers.forEach(customer => {
        html += `
            <div style="border:1px solid #ddd; margin:5px 0; padding:8px; border-radius:5px;">
                <p><strong>${customer.fullName}</strong> - ${customer.email}</p>
                <p>Phone: ${customer.phone} | Orders: ${customer.orderCount || 0} | Total Spent: ₹${customer.totalSpent || 0}</p>
            </div>
        `;
    });
    
    html += `
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

function closeAdminPanel() {
    const panel = document.querySelector('div[style*="position:fixed"][style*="z-index:10000"]');
    if(panel) panel.remove();
}

function viewOrderImage(orderId) {
    const allOrders = JSON.parse(localStorage.getItem("allOrders")) || [];
    const order = allOrders.find(o => o.orderId == orderId);
    if(order && order.paymentScreenshot) {
        const win = window.open();
        win.document.write(`<html><body style="display:flex; justify-content:center; align-items:center; min-height:100vh; background:#000;"><img src="${order.paymentScreenshot}" style="max-width:100%; max-height:100vh;"></body></html>`);
    }
}

function viewReferenceImage(orderId) {
    const allOrders = JSON.parse(localStorage.getItem("allOrders")) || [];
    const order = allOrders.find(o => o.orderId == orderId);
    if(order && order.referenceImage) {
        const win = window.open();
        win.document.write(`<html><body style="display:flex; justify-content:center; align-items:center; min-height:100vh; background:#000;"><img src="${order.referenceImage}" style="max-width:100%; max-height:100vh;"></body></html>`);
    }
}

// Keyboard shortcut: Ctrl+Shift+A for Admin Panel
document.addEventListener('keydown', function(e) {
    if(e.ctrlKey && e.shiftKey && e.key === 'A') {
        showAdminPanel();
    }
});

// ===========================
// HOMEPAGE PRODUCTS
// ===========================
async function loadHomeProducts() {
    try {
        const drawingsRes = await fetch('data/drawings.json');
        const drawings = await drawingsRes.json();
        const first6Drawings = drawings.slice(0, 6);
        
        const drawingsGrid = document.getElementById('homeDrawingsGrid');
        if(drawingsGrid) {
            drawingsGrid.innerHTML = first6Drawings.map(drawing => {
                const originalPrice = drawing.price + drawing.delivery;
                const discount = getTotalDiscount('drawing');
                const discountedPrice = discount > 0 ? Math.floor(originalPrice * (1 - discount)) : originalPrice;
                const discountPercent = Math.floor(discount * 100);
                const discountHtml = discount > 0 ? `<span style="color:#00ff88;"> (${discountPercent}% OFF)</span>` : '';
                
                if(drawing.sold) {
                    return `
                    <div class="card">
                        <img src="${drawing.image}" alt="${drawing.name}" onerror="this.src='images/placeholder.jpg'">
                        <h3>${drawing.name}</h3>
                        <p>${drawing.description}</p>
                        <p><strong>₹${discountedPrice}</strong>${discountHtml}</p>
                        <div class="sold-badge">SOLD OUT</div>
                    </div>`;
                }
                
                return `
                <div class="card">
                    <img src="${drawing.image}" alt="${drawing.name}" onerror="this.src='images/placeholder.jpg'">
                    <h3>${drawing.name}</h3>
                    <p>${drawing.description}</p>
                    <p><strong>₹${discountedPrice}</strong>${discountHtml}</p>
                    <div class="buttons" style="padding:10px;">
                        <button onclick="addWishlist('${drawing.name.replace(/'/g, "\\'")}')" style="padding:8px; font-size:12px;">❤️ Wishlist</button>
                        <button onclick="addCart('${drawing.name.replace(/'/g, "\\'")}', ${discountedPrice})" style="padding:8px; font-size:12px;">🛒 Cart</button>
                        <button onclick="showDeliveryForm('${drawing.name.replace(/'/g, "\\'")}', ${discountedPrice}, 'drawing', ${drawing.id})" style="padding:8px; font-size:12px;">💳 Buy Now</button>
                    </div>
                </div>`;
            }).join('');
        }
        
        const keychainsRes = await fetch('data/keychains.json');
        const keychains = await keychainsRes.json();
        const first6Keychains = keychains.slice(0, 6);
        
        const keychainsGrid = document.getElementById('homeKeychainsGrid');
        if(keychainsGrid) {
            keychainsGrid.innerHTML = first6Keychains.map(keychain => {
                const originalPrice = keychain.price;
                const discount = getTotalDiscount('keychain');
                const discountedPrice = discount > 0 ? Math.floor(originalPrice * (1 - discount)) : originalPrice;
                const discountPercent = Math.floor(discount * 100);
                const discountHtml = discount > 0 ? `<span style="color:#00ff88;"> (${discountPercent}% OFF)</span>` : '';
                
                if(keychain.sold) {
                    return `
                    <div class="card">
                        <img src="${keychain.image}" alt="${keychain.name}" onerror="this.src='images/placeholder.jpg'">
                        <h3>${keychain.name}</h3>
                        <p>${keychain.description}</p>
                        <p><strong>₹${discountedPrice}</strong>${discountHtml}</p>
                        <div class="sold-badge">SOLD OUT</div>
                    </div>`;
                }
                
                return `
                <div class="card">
                    <img src="${keychain.image}" alt="${keychain.name}" onerror="this.src='images/placeholder.jpg'">
                    <h3>${keychain.name}</h3>
                    <p>${keychain.description}</p>
                    <p><strong>₹${discountedPrice}</strong>${discountHtml}</p>
                    <div class="buttons" style="padding:10px;">
                        <button onclick="addWishlist('${keychain.name.replace(/'/g, "\\'")}')" style="padding:8px; font-size:12px;">❤️ Wishlist</button>
                        <button onclick="addCart('${keychain.name.replace(/'/g, "\\'")}', ${discountedPrice})" style="padding:8px; font-size:12px;">🛒 Cart</button>
                        <button onclick="showDeliveryForm('${keychain.name.replace(/'/g, "\\'")}', ${discountedPrice}, 'keychain', ${keychain.id})" style="padding:8px; font-size:12px;">💳 Buy Now</button>
                    </div>
                </div>`;
            }).join('');
        }
    } catch(error) {
        console.error("Error loading home products:", error);
    }
}

// ===========================
// UPDATE OFFER BANNER
// ===========================
function updateOfferBanner() {
    const isFirstDay = isMonthlyOfferDay();
    const bannerSpans = document.querySelectorAll('#offerBannerText');
    bannerSpans.forEach(span => {
        if(span) {
            if(isFirstDay) {
                span.innerHTML = "🎉 MONTHLY OFFER: 10% OFF ON EVERYTHING TODAY ONLY! (1st Day Special) 🎉";
            } else {
                span.innerHTML = "✨ FIRST 20 CUSTOMERS GET 20% OFF | FIRST 10 COMMISSIONS GET 40% OFF ✨";
            }
        }
    });
}

// ===========================
// FLOATING ART ROTATION
// ===========================
const container = document.getElementById("floatingContainer");
let rotation = 0;
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener("touchstart", (e) => {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener("touchend", (e) => {
    touchEndY = e.changedTouches[0].screenY;
    if(container) {
        if(touchStartY - touchEndY > 50) {
            rotation += 30;
            container.style.transform = `rotate(${rotation}deg)`;
        } else if(touchEndY - touchStartY > 50) {
            rotation -= 30;
            container.style.transform = `rotate(${rotation}deg)`;
        }
    }
});

window.addEventListener("wheel", (e) => {
    if(container) {
        if(e.deltaY < 0) rotation += 15;
        else rotation -= 15;
        container.style.transform = `rotate(${rotation}deg)`;
    }
});

// ===========================
// AUTO SAVE & INITIALIZATION
// ===========================
window.addEventListener("beforeunload", () => {
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
});

document.addEventListener("DOMContentLoaded", () => {
    if(document.getElementById("drawingsContainer")) loadDrawings();
    if(document.getElementById("keychainsContainer")) loadKeychains();
    if(document.getElementById("homeDrawingsGrid")) loadHomeProducts();
    updateOfferBanner();
    updateCustomerDisplay();
    
    const video = document.getElementById("bgVideo");
    if(video) {
        video.muted = true;
        video.play().catch(error => console.log("Video autoplay blocked:", error));
    }
});
