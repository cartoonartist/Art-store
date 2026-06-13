// ===========================
// CART & WISHLIST STORAGE
// ===========================

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

updateCounters();

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
    
    container.innerHTML = pageDrawings.map(drawing => `
        <div class="card">
            <img src="${drawing.image}" alt="${drawing.name}" onerror="this.src='images/placeholder.jpg'">
            <h3>${drawing.name}</h3>
            <p>${drawing.description}</p>
            <p>Size: ${drawing.size} | Paper: ${drawing.paper}</p>
            <p>Price: ₹${drawing.price} + ₹${drawing.delivery} delivery</p>
            <p><strong>Total: ₹${drawing.price + drawing.delivery}</strong></p>
            ${drawing.sold ? '<div class="sold-badge">SOLD OUT</div>' : `
                <div class="buttons">
                    <button onclick="addWishlist('${drawing.name}')">❤️ Wishlist</button>
                    <button onclick="addCart('${drawing.name}', ${drawing.price + drawing.delivery})">🛒 Cart</button>
                    <button onclick="buyNow('${drawing.name}', ${drawing.price + drawing.delivery}, 'drawing', ${drawing.id})">💳 Buy Now</button>
                </div>
            `}
        </div>
    `).join('');
    
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
    
    container.innerHTML = pageKeychains.map(keychain => `
        <div class="card">
            <img src="${keychain.image}" alt="${keychain.name}" onerror="this.src='images/placeholder.jpg'">
            <h3>${keychain.name}</h3>
            <p>${keychain.description}</p>
            <p>Price: ₹${keychain.price} ${keychain.deliveryIncluded ? '(Delivery included)' : '+ delivery'}</p>
            ${keychain.sold ? '<div class="sold-badge">SOLD OUT</div>' : `
                <div class="buttons">
                    <button onclick="addWishlist('${keychain.name}')">❤️ Wishlist</button>
                    <button onclick="addCart('${keychain.name}', ${keychain.price})">🛒 Cart</button>
                    <button onclick="buyNow('${keychain.name}', ${keychain.price}, 'keychain', ${keychain.id})">💳 Buy Now</button>
                </div>
            `}
        </div>
    `).join('');
    
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
// BUY NOW (FIXED)
// ===========================
let currentOrderType = null;
let currentOrderId = null;
let currentOrderPrice = null;
let currentOrderName = null;

function buyNow(product, price, type, id) {
    currentOrderName = product;
    currentOrderPrice = price;
    currentOrderType = type;
    currentOrderId = id;
    
    const popup = document.getElementById("paymentPopup");
    if(popup) {
        popup.style.display = "block";
        // Clear previous file input
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
        const total = sizePrice + mediumPrice;
        commissionPrice.innerText = "Total : ₹" + total;
    }
}

if(sheetSize && medium && commissionPrice) {
    sheetSize.addEventListener("change", calculateCommission);
    medium.addEventListener("change", calculateCommission);
    calculateCommission();
}

// ===========================
// COMMISSION ORDER (FIXED)
// ===========================
function commissionOrder() {
    const sizePrice = parseInt(sheetSize?.value) || 0;
    const mediumPrice = parseInt(medium?.value) || 0;
    const total = sizePrice + mediumPrice;
    
    // Get form values
    const fullName = document.querySelector('#commissionForm input[type="text"]')?.value || "";
    const address = document.querySelector('#commissionForm textarea')?.value || "";
    const city = document.querySelectorAll('#commissionForm input[type="text"]')[1]?.value || "";
    const pincode = document.querySelector('#commissionForm input[type="number"]')?.value || "";
    const phone = document.querySelector('#commissionForm input[type="tel"]')?.value || "";
    const sheetSizeText = sheetSize?.options[sheetSize.selectedIndex]?.text || "";
    const mediumText = medium?.options[medium.selectedIndex]?.text || "";
    
    if(!fullName || !address || !city || !pincode || !phone) {
        alert("Please fill all commission form fields.");
        return;
    }
    
    currentOrderType = "commission";
    currentOrderName = `Commission: ${mediumText} on ${sheetSizeText}`;
    currentOrderPrice = total;
    currentOrderId = Date.now();
    
    // Store commission details for email
    window.commissionDetails = {
        fullName, address, city, pincode, phone, sheetSizeText, mediumText
    };
    
    const popup = document.getElementById("paymentPopup");
    if(popup) {
        popup.style.display = "block";
        const fileInput = document.getElementById("paymentScreenshot");
        if(fileInput) fileInput.value = "";
    }
}

// ===========================
// SUBMIT PAYMENT (FIXED)
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
                Address: ${window.commissionDetails?.address || "N/A"}, ${window.commissionDetails?.city || "N/A"} - ${window.commissionDetails?.pincode || "N/A"}
                Phone: ${window.commissionDetails?.phone || "N/A"}
                Details: ${window.commissionDetails?.mediumText || "N/A"} on ${window.commissionDetails?.sheetSizeText || "N/A"}
                Total Price: ₹${currentOrderPrice}
                Order Date: ${new Date().toLocaleString()}
            `;
        } else {
            emailSubject = `NEW ORDER - ${currentOrderName}`;
            emailMessage = `
                ORDER TYPE: ${currentOrderType?.toUpperCase() || "PRODUCT"}
                Product: ${currentOrderName}
                Product ID: ${currentOrderId}
                Total Price: ₹${currentOrderPrice}
                Order Date: ${new Date().toLocaleString()}
            `;
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
                user_email: "customer@example.com",
                message: emailMessage
            }
        )
        .then(function() {
            alert("✅ Order submitted successfully! We'll contact you within 24 hours.");
            document.getElementById("paymentPopup").style.display = "none";
            
            // Reset order data
            currentOrderType = null;
            currentOrderId = null;
            currentOrderPrice = null;
            currentOrderName = null;
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
    
    // Video autoplay
    const video = document.getElementById("bgVideo");
    if(video) {
        video.muted = true;
        video.play().catch(error => console.log("Video autoplay blocked:", error));
    }
});
