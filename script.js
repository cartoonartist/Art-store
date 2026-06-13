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
    return today.getDate() === 1; // Returns true if it's the 1st day of the month
}

function getMonthlyOfferDiscount() {
    return isMonthlyOfferDay() ? 0.10 : 0; // 10% off on 1st of month
}

function getTotalDiscount(productType) {
    let totalDiscount = 0;
    
    // Monthly offer (10% off on 1st of month)
    totalDiscount += getMonthlyOfferDiscount();
    
    // First customer offers
    if(productType === 'drawing') {
        totalDiscount += getDrawingDiscount();
    } else if(productType === 'keychain') {
        totalDiscount += getKeychainDiscount();
    } else if(productType === 'commission') {
        totalDiscount += getCommissionDiscount();
    }
    
    // Cap discount at maximum 50%
    return Math.min(totalDiscount, 0.50);
}

// ===========================
// TRACK FIRST TIME BUYERS
// ===========================
let drawingBuyers = JSON.parse(localStorage.getItem("drawingBuyers")) || [];
let keychainBuyers = JSON.parse(localStorage.getItem("keychainBuyers")) || [];
let commissionBuyers = JSON.parse(localStorage.getItem("commissionBuyers")) || [];

function getDrawingDiscount() {
    return drawingBuyers.length < 20 ? 0.20 : 0; // 20% off for first 20 customers
}

function getKeychainDiscount() {
    return keychainBuyers.length < 20 ? 0.20 : 0; // 20% off for first 20 customers
}

function getCommissionDiscount() {
    return commissionBuyers.length < 10 ? 0.40 : 0; // 40% off for first 10 customers
}

function markDrawingBuyer(email) {
    if(!drawingBuyers.includes(email) && drawingBuyers.length < 20) {
        drawingBuyers.push(email);
        localStorage.setItem("drawingBuyers", JSON.stringify(drawingBuyers));
    }
}

function markKeychainBuyer(email) {
    if(!keychainBuyers.includes(email) && keychainBuyers.length < 20) {
        keychainBuyers.push(email);
        localStorage.setItem("keychainBuyers", JSON.stringify(keychainBuyers));
    }
}

function markCommissionBuyer(email) {
    if(!commissionBuyers.includes(email) && commissionBuyers.length < 10) {
        commissionBuyers.push(email);
        localStorage.setItem("commissionBuyers", JSON.stringify(commissionBuyers));
    }
}

// ===========================
// GET OFFER BANNER TEXT
// ===========================
function getOfferBannerText() {
    let bannerText = "";
    if(isMonthlyOfferDay()) {
        bannerText = "🎉 MONTHLY OFFER: 10% OFF ON EVERYTHING TODAY ONLY! (1st Day Special) 🎉";
    } else {
        bannerText = "✨ FIRST 20 CUSTOMERS GET 20% OFF | FIRST 10 COMMISSIONS GET 40% OFF ✨";
    }
    return bannerText;
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
        if(container) container.innerHTML = "<p>Error loading drawings. Please try again.</p>";
    }
}

function renderDrawings() {
    const container = document.getElementById("drawingsContainer");
    if(!container) return;
    
    const start = (currentDrawingsPage - 1) * drawingsPerPage;
    const end = start + drawingsPerPage;
    const pageDrawings = allDrawings.slice(start, end);
    
    if(pageDrawings.length === 0) {
        container.innerHTML = "<p style='text-align:center;'>No drawings available.</p>";
        updateDrawingsPagination();
        return;
    }
    
    container.innerHTML = pageDrawings.map(drawing => {
        const originalPrice = drawing.price + drawing.delivery;
        const totalDiscount = getTotalDiscount('drawing');
        const discountedPrice = totalDiscount > 0 ? Math.floor(originalPrice * (1 - totalDiscount)) : originalPrice;
        
        let discountText = "";
        if(totalDiscount > 0) {
            const discountPercent = Math.floor(totalDiscount * 100);
            discountText = `<span style="color:#00ff88; font-size:14px;"> (${discountPercent}% OFF! Was ₹${originalPrice})</span>`;
        }
        
        return `
        <div class="card">
            <img src="${drawing.image}" alt="${drawing.name}" onerror="this.src='images/placeholder.jpg'">
            <h3>${drawing.name}</h3>
            <p>${drawing.description}</p>
            <p>Size: ${drawing.size} | Paper: ${drawing.paper}</p>
            <p><strong style="color:#00ff88;">🔥 Price: ₹${discountedPrice}</strong>${discountText}</p>
            ${drawing.sold ? '<div class="sold-badge">SOLD OUT</div>' : `
                <div class="buttons">
                    <button onclick="addWishlist('${drawing.name}')">❤️ Wishlist</button>
                    <button onclick="addCart('${drawing.name}', ${discountedPrice})">🛒 Cart</button>
                    <button onclick="buyNow('${drawing.name}', ${discountedPrice}, 'drawing', ${drawing.id})">💳 Buy Now</button>
                </div>
            `}
        </div>
    `}).join('');
    
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
        buttons += `<button onclick="goToDrawingsPage(${i})" ${i === currentDrawingsPage ? 'style="background:#00d4ff;"' : ''}>${i}</button>`;
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
        if(container) container.innerHTML = "<p>Error loading keychains. Please try again.</p>";
    }
}

function renderKeychains() {
    const container = document.getElementById("keychainsContainer");
    if(!container) return;
    
    const start = (currentKeychainsPage - 1) * keychainsPerPage;
    const end = start + keychainsPerPage;
    const pageKeychains = allKeychains.slice(start, end);
    
    if(pageKeychains.length === 0) {
        container.innerHTML = "<p style='text-align:center;'>No keychains available.</p>";
        updateKeychainsPagination();
        return;
    }
    
    container.innerHTML = pageKeychains.map(keychain => {
        const originalPrice = keychain.price;
        const totalDiscount = getTotalDiscount('keychain');
        const discountedPrice = totalDiscount > 0 ? Math.floor(originalPrice * (1 - totalDiscount)) : originalPrice;
        
        let discountText = "";
        if(totalDiscount > 0) {
            const discountPercent = Math.floor(totalDiscount * 100);
            discountText = `<span style="color:#00ff88; font-size:14px;"> (${discountPercent}% OFF! Was ₹${originalPrice})</span>`;
        }
        
        return `
        <div class="card">
            <img src="${keychain.image}" alt="${keychain.name}" onerror="this.src='images/placeholder.jpg'">
            <h3>${keychain.name}</h3>
            <p>${keychain.description}</p>
            <p><strong style="color:#00ff88;">🔥 Price: ₹${discountedPrice}</strong>${discountText}</p>
            <p style="font-size:12px;">${keychain.deliveryIncluded ? '✓ Delivery included' : '+ delivery extra'}</p>
            ${keychain.sold ? '<div class="sold-badge">SOLD OUT</div>' : `
                <div class="buttons">
                    <button onclick="addWishlist('${keychain.name}')">❤️ Wishlist</button>
                    <button onclick="addCart('${keychain.name}', ${discountedPrice})">🛒 Cart</button>
                    <button onclick="buyNow('${keychain.name}', ${discountedPrice}, 'keychain', ${keychain.id})">💳 Buy Now</button>
                </div>
            `}
        </div>
    `}).join('');
    
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
        buttons += `<button onclick="goToKeychainsPage(${i})" ${i === currentKeychainsPage ? 'style="background:#00d4ff;"' : ''}>${i}</button>`;
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
// WISHLIST
// ===========================
function addWishlist(product) {
    if(wishlist.includes(product)) {
        alert(product + " is already in your wishlist!");
        return;
    }
    wishlist.push(product);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    updateCounters();
    alert(product + " added to wishlist!");
}

// ===========================
// CART
// ===========================
function addCart(product, price) {
    cart.push({ product, price });
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCounters();
    alert(product + " added to cart! (₹" + price + ")");
}

// ===========================
// BUY NOW
// ===========================
let currentOrderType = null;
let currentOrderId = null;
let currentOrderPrice = null;
let currentOrderName = null;
let currentCustomerEmail = null;

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

// ===========================
// CLICK OUTSIDE POPUP
// ===========================
window.addEventListener("click", (e) => {
    const popup = document.getElementById("paymentPopup");
    if(e.target === popup) popup.style.display = "none";
});

// ===========================
// COMMISSION PRICE
// ===========================
const sheetSize = document.getElementById("sheetSize");
const medium = document.getElementById("medium");
const commissionPrice = document.getElementById("commissionPrice");

function calculateCommission() {
    if(sheetSize && medium && commissionPrice) {
        const sizePrice = parseInt(sheetSize.value) || 0;
        const mediumPrice = parseInt(medium.value) || 0;
        let total = sizePrice + mediumPrice;
        const totalDiscount = getTotalDiscount('commission');
        if(totalDiscount > 0) {
            total = Math.floor(total * (1 - totalDiscount));
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
// COMMISSION ORDER
// ===========================
function commissionOrder() {
    const sizePrice = parseInt(sheetSize?.value) || 0;
    const mediumPrice = parseInt(medium?.value) || 0;
    let total = sizePrice + mediumPrice;
    const totalDiscount = getTotalDiscount('commission');
    const discountPercent = Math.floor(totalDiscount * 100);
    
    if(totalDiscount > 0) {
        total = Math.floor(total * (1 - totalDiscount));
    }
    
    // Get form values
    const fullName = document.getElementById('commissionName')?.value || "";
    const address = document.getElementById('commissionAddress')?.value || "";
    const city = document.getElementById('commissionCity')?.value || "";
    const pincode = document.getElementById('commissionPincode')?.value || "";
    const phone = document.getElementById('commissionPhone')?.value || "";
    const email = document.getElementById('commissionEmail')?.value || "";
    const referenceDesc = document.getElementById('commissionReference')?.value || "";
    const sheetSizeText = sheetSize?.options[sheetSize.selectedIndex]?.text || "";
    const mediumText = medium?.options[medium.selectedIndex]?.text || "";
    
    if(!fullName || !address || !city || !pincode || !phone || !email || !referenceDesc) {
        alert("Please fill all commission form fields including reference image description and email.");
        return;
    }
    
    currentCustomerEmail = email;
    currentOrderType = "commission";
    currentOrderName = `Commission: ${mediumText} on ${sheetSizeText}`;
    currentOrderPrice = total;
    currentOrderId = Date.now();
    
    // Store commission details for email
    window.commissionDetails = {
        fullName, address, city, pincode, phone, email, referenceDesc, sheetSizeText, mediumText, discountPercent
    };
    
    const popup = document.getElementById("paymentPopup");
    if(popup) {
        popup.style.display = "block";
        const fileInput = document.getElementById("paymentScreenshot");
        if(fileInput) fileInput.value = "";
    }
}

// ===========================
// SUBMIT PAYMENT
// ===========================
const submitBtn = document.getElementById("submitPayment");
if(submitBtn) {
    submitBtn.addEventListener("click", function() {
        const screenshot = document.getElementById("paymentScreenshot");
        
        if(!screenshot || screenshot.files.length === 0) {
            alert("Please upload payment screenshot first.");
            return;
        }
        
        // Build email details
        let emailMessage = "";
        let emailSubject = "";
        
        if(currentOrderType === "commission") {
            emailSubject = `NEW COMMISSION ORDER - ${currentOrderName}`;
            emailMessage = `
                ORDER TYPE: Commission
                Order ID: ${currentOrderId}
                Customer: ${window.commissionDetails?.fullName || "N/A"}
                Email: ${window.commissionDetails?.email || "N/A"}
                Address: ${window.commissionDetails?.address || "N/A"}, ${window.commissionDetails?.city || "N/A"} - ${window.commissionDetails?.pincode || "N/A"}
                Phone: ${window.commissionDetails?.phone || "N/A"}
                Details: ${window.commissionDetails?.mediumText || "N/A"} on ${window.commissionDetails?.sheetSizeText || "N/A"}
                Reference Image Description: ${window.commissionDetails?.referenceDesc || "N/A"}
                Discount Applied: ${window.commissionDetails?.discountPercent || 0}% OFF
                Total Price: ₹${currentOrderPrice}
                Order Date: ${new Date().toLocaleString()}
            `;
            markCommissionBuyer(window.commissionDetails?.email);
        } else {
            const totalDiscount = getTotalDiscount(currentOrderType);
            const discountPercent = Math.floor(totalDiscount * 100);
            emailSubject = `NEW ORDER - ${currentOrderName}`;
            emailMessage = `
                ORDER TYPE: ${currentOrderType?.toUpperCase() || "PRODUCT"}
                Product: ${currentOrderName}
                Product ID: ${currentOrderId}
                Original Price: ₹${Math.floor(currentOrderPrice / (1 - totalDiscount)) || currentOrderPrice}
                Discount Applied: ${discountPercent}% OFF
                Total Price: ₹${currentOrderPrice}
                Order Date: ${new Date().toLocaleString()}
            `;
            if(currentOrderType === 'drawing') {
                markDrawingBuyer(currentCustomerEmail || 'customer@example.com');
            } else if(currentOrderType === 'keychain') {
                markKeychainBuyer(currentCustomerEmail || 'customer@example.com');
            }
        }
        
        // Add monthly offer info to email
        if(isMonthlyOfferDay()) {
            emailMessage += `\n\n🎉 MONTHLY SPECIAL: 10% OFF applied (1st Day Offer) 🎉`;
        }
        
        emailjs.send(
            "service_t2hgt6w",
            "template_9q28bu6",
            {
                product_name: currentOrderName,
                product_id: currentOrderId,
                sale_date: new Date().toLocaleString(),
                frame_type: currentOrderType === "commission" ? "Commission Order" : "Product Purchase",
                total_price: currentOrderPrice,
                commission_details: emailMessage,
                user_email: currentCustomerEmail || "customer@example.com",
                message: emailMessage
            }
        )
        .then(function() {
            alert("✅ Order submitted successfully! We'll contact you within 24 hours via email/Instagram.");
            document.getElementById("paymentPopup").style.display = "none";
            
            // Reset order data
            currentOrderType = null;
            currentOrderId = null;
            currentOrderPrice = null;
            currentOrderName = null;
            currentCustomerEmail = null;
            window.commissionDetails = null;
            
            // Clear file input
            if(screenshot) screenshot.value = "";
        })
        .catch(function(error) {
            console.error("Email error:", error);
            alert("❌ Order received but notification failed. Please DM on Instagram @kanishkv_456 with your screenshot.");
        });
    });
}

// ===========================
// UPDATE OFFER BANNER ON ALL PAGES
// ===========================
function updateOfferBanner() {
    const banners = document.querySelectorAll('.offer-banner');
    banners.forEach(banner => {
        if(banner) {
            banner.innerHTML = getOfferBannerText();
        }
    });
}

// ===========================
// FLOATING ART ROTATION
// ===========================
const container = document.getElementById("floatingContainer");
let rotation = 0;

// Touch Swipe
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener("touchstart", (e) => {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener("touchend", (e) => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    if(container) {
        if(touchStartY - touchEndY > 50) {
            rotation += 30;
            container.style.transform = `rotate(${rotation}deg)`;
        } else if(touchEndY - touchStartY > 50) {
            rotation -= 30;
            container.style.transform = `rotate(${rotation}deg)`;
        }
    }
}

// Mouse Wheel Support
window.addEventListener("wheel", (e) => {
    if(container) {
        if(e.deltaY < 0) rotation += 15;
        else rotation -= 15;
        container.style.transform = `rotate(${rotation}deg)`;
    }
});

// ===========================
// AUTO SAVE & INIT
// ===========================
window.addEventListener("beforeunload", () => {
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
});

document.addEventListener("DOMContentLoaded", () => {
    // Load products based on current page
    if(document.getElementById("drawingsContainer")) loadDrawings();
    if(document.getElementById("keychainsContainer")) loadKeychains();
    
    // Update offer banners
    updateOfferBanner();
    
    // Video autoplay
    const video = document.getElementById("bgVideo");
    if(video) {
        video.muted = true;
        video.play().catch(error => console.log("Video autoplay blocked:", error));
    }
});
