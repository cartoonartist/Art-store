// ===========================
// CART & WISHLIST STORAGE
// ===========================

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

updateCounters();

// ===========================
// MONTHLY OFFER CHECK (10% off on 1st day of every month)
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
        if(container) container.innerHTML = "<p style='text-align:center;color:red;'>Error loading drawings. Please make sure drawings.json exists.</p>";
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
                <button onclick="buyNow('${drawing.name}', ${discountedPrice}, 'drawing', ${drawing.id})">💳 Buy Now</button>
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
        if(container) container.innerHTML = "<p style='text-align:center;color:red;'>Error loading keychains. Please make sure keychains.json exists.</p>";
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
                <button onclick="buyNow('${keychain.name}', ${discountedPrice}, 'keychain', ${keychain.id})">💳 Buy Now</button>
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
// BUY NOW - GLOBAL VARIABLES
// ===========================
let currentOrderType = null;
let currentOrderId = null;
let currentOrderPrice = null;
let currentOrderName = null;
let currentCustomerEmail = null;
let currentReferenceImage = null;

function buyNow(product, price, type, id) {
    currentOrderName = product;
    currentOrderPrice = price;
    currentOrderType = type;
    currentOrderId = id;
    
    const popup = document.getElementById("paymentPopup");
    if(popup) {
        popup.style.display = "block";
        const fileInput = document.getElementById("paymentScreenshot");
        if(fileInput) fileInput.value = "";
    } else {
        alert("Payment system error. Please contact support.");
    }
}

// ===========================
// CLOSE POPUP
// ===========================
const closeBtn = document.getElementById("closePopup");
if(closeBtn) {
    closeBtn.addEventListener("click", () => {
        document.getElementById("paymentPopup").style.display = "none";
    });
}

window.addEventListener("click", (e) => {
    const popup = document.getElementById("paymentPopup");
    if(e.target === popup) popup.style.display = "none";
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

// Function to convert image to base64
function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// ===========================
// COMMISSION ORDER (with image file)
// ===========================
async function commissionOrder() {
    // Get all form values
    const fullName = document.getElementById('commissionName')?.value.trim() || "";
    const email = document.getElementById('commissionEmail')?.value.trim() || "";
    const address = document.getElementById('commissionAddress')?.value.trim() || "";
    const city = document.getElementById('commissionCity')?.value.trim() || "";
    const pincode = document.getElementById('commissionPincode')?.value.trim() || "";
    const phone = document.getElementById('commissionPhone')?.value.trim() || "";
    const referenceImage = document.getElementById('commissionReferenceImage')?.files[0];
    
    // Validation
    if(!fullName) {
        alert("❌ Please enter your full name.");
        return;
    }
    if(!email) {
        alert("❌ Please enter your email address.");
        return;
    }
    if(!address) {
        alert("❌ Please enter your complete address.");
        return;
    }
    if(!city) {
        alert("❌ Please enter your city.");
        return;
    }
    if(!pincode) {
        alert("❌ Please enter your pincode.");
        return;
    }
    if(!phone) {
        alert("❌ Please enter your phone number.");
        return;
    }
    if(!referenceImage) {
        alert("❌ REFERENCE IMAGE IS MANDATORY! Please upload a reference image of what you want me to draw.");
        return;
    }
    
    // Convert image to base64 for email
    let imageBase64 = "";
    try {
        imageBase64 = await imageToBase64(referenceImage);
    } catch(error) {
        console.error("Error converting image:", error);
        alert("Error processing image. Please try again.");
        return;
    }
    
    const sizePrice = parseInt(sheetSize?.value) || 0;
    const mediumPrice = parseInt(medium?.value) || 0;
    let total = sizePrice + mediumPrice;
    const discount = getTotalDiscount('commission');
    const discountPercent = Math.floor(discount * 100);
    
    if(discount > 0) {
        total = Math.floor(total * (1 - discount));
    }
    
    const sheetSizeText = sheetSize?.options[sheetSize.selectedIndex]?.text || "";
    const mediumText = medium?.options[medium.selectedIndex]?.text || "";
    
    currentCustomerEmail = email;
    currentOrderType = "commission";
    currentOrderName = `Commission: ${mediumText} on ${sheetSizeText}`;
    currentOrderPrice = total;
    currentOrderId = Date.now();
    currentReferenceImage = imageBase64;
    
    window.commissionDetails = {
        fullName, address, city, pincode, phone, email, 
        referenceImageName: referenceImage.name,
        sheetSizeText, mediumText, 
        discountPercent, isMonthlyOffer: isMonthlyOfferDay()
    };
    
    const popup = document.getElementById("paymentPopup");
    if(popup) {
        popup.style.display = "block";
        const fileInput = document.getElementById("paymentScreenshot");
        if(fileInput) fileInput.value = "";
    }
}

// ===========================
// SUBMIT PAYMENT (with commission image)
// ===========================
const submitBtn = document.getElementById("submitPayment");
if(submitBtn) {
    submitBtn.addEventListener("click", async function() {
        const screenshot = document.getElementById("paymentScreenshot");
        
        if(!screenshot || screenshot.files.length === 0) {
            alert("📸 Please upload payment screenshot first.");
            return;
        }
        
        let emailMessage = "";
        let emailSubject = "";
        
        if(currentOrderType === "commission") {
            emailSubject = `🎨 NEW COMMISSION ORDER - ${currentOrderName}`;
            emailMessage = `
╔═══════════════════════════════════════╗
║        NEW COMMISSION ORDER           ║
╠═══════════════════════════════════════╣
║ Order ID: ${currentOrderId}
║ Order Date: ${new Date().toLocaleString()}
║
║ 👤 CUSTOMER DETAILS:
║ Name: ${window.commissionDetails?.fullName || "N/A"}
║ Email: ${window.commissionDetails?.email || "N/A"}
║ Phone: ${window.commissionDetails?.phone || "N/A"}
║ Address: ${window.commissionDetails?.address || "N/A"}
║ City: ${window.commissionDetails?.city || "N/A"}
║ Pincode: ${window.commissionDetails?.pincode || "N/A"}
║
║ 🎨 COMMISSION DETAILS:
║ Size: ${window.commissionDetails?.sheetSizeText || "N/A"}
║ Medium: ${window.commissionDetails?.mediumText || "N/A"}
║
║ 📷 REFERENCE IMAGE:
║ Filename: ${window.commissionDetails?.referenceImageName || "N/A"}
║ (Image attached separately as base64)
║
║ 💰 PRICE DETAILS:
║ Discount Applied: ${window.commissionDetails?.discountPercent || 0}% OFF
║ Monthly Offer Applied: ${window.commissionDetails?.isMonthlyOffer ? "YES (10%)" : "NO"}
║ Total Price: ₹${currentOrderPrice}
║
║ 📎 Payment screenshot attached separately.
╚═══════════════════════════════════════╝
            `;
            markCommissionBuyer(window.commissionDetails?.email);
        } else {
            const discount = getTotalDiscount(currentOrderType);
            const discountPercent = Math.floor(discount * 100);
            emailSubject = `🛍️ NEW ORDER - ${currentOrderName}`;
            emailMessage = `
╔═══════════════════════════════════════╗
║           NEW PRODUCT ORDER           ║
╠═══════════════════════════════════════╣
║ Order ID: ${currentOrderId}
║ Order Date: ${new Date().toLocaleString()}
║
║ 📦 PRODUCT DETAILS:
║ Type: ${currentOrderType?.toUpperCase() || "PRODUCT"}
║ Name: ${currentOrderName}
║ Product ID: ${currentOrderId}
║
║ 💰 PRICE DETAILS:
║ Final Price: ₹${currentOrderPrice}
║ Discount Applied: ${discountPercent}% OFF
║ Monthly Offer: ${isMonthlyOfferDay() ? "YES (10%)" : "NO"}
║
║ 📎 Payment screenshot attached separately.
╚═══════════════════════════════════════╝
            `;
            if(currentOrderType === 'drawing') {
                markDrawingBuyer(currentCustomerEmail || 'customer@example.com');
            } else if(currentOrderType === 'keychain') {
                markKeychainBuyer(currentCustomerEmail || 'customer@example.com');
            }
        }
        
        // Prepare email data with commission image if exists
        const emailData = {
            product_name: currentOrderName,
            product_id: currentOrderId,
            sale_date: new Date().toLocaleString(),
            frame_type: currentOrderType === "commission" ? "Commission Order" : "Product Purchase",
            total_price: currentOrderPrice,
            commission_details: emailMessage,
            user_email: currentCustomerEmail || "customer@example.com",
            message: emailMessage
        };
        
        // Add reference image for commission orders
        if(currentOrderType === "commission" && currentReferenceImage) {
            emailData.reference_image = currentReferenceImage;
            emailData.reference_image_name = window.commissionDetails?.referenceImageName || "reference.jpg";
        }
        
        emailjs.send(
            "service_t2hgt6w",
            "template_9q28bu6",
            emailData
        )
        .then(function() {
            alert("✅ ORDER SUBMITTED SUCCESSFULLY!\n\nWe'll contact you within 24 hours via email/Instagram.\n\n📧 Check your email for confirmation.\n🖼️ Your reference image has been received.");
            document.getElementById("paymentPopup").style.display = "none";
            
            // Reset commission form
            if(currentOrderType === "commission") {
                const form = document.getElementById("commissionForm");
                if(form) form.reset();
                calculateCommission();
            }
            
            currentOrderType = null;
            currentOrderId = null;
            currentOrderPrice = null;
            currentOrderName = null;
            currentCustomerEmail = null;
            currentReferenceImage = null;
            window.commissionDetails = null;
            
            if(screenshot) screenshot.value = "";
        })
        .catch(function(error) {
            console.error("Email error:", error);
            alert("❌ Order received but notification failed.\n\nPlease DM your screenshot and reference image on Instagram @kanishkv_456\n\nWe will process your order manually.");
            document.getElementById("paymentPopup").style.display = "none";
        });
    });
}

// ===========================
// HOMEPAGE PRODUCTS WITH ALL BUTTONS
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
                    <h3>${drawing.name}</
