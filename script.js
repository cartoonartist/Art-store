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

    const cartCount =
    document.getElementById("cartCount");

    const wishlistCount =
    document.getElementById("wishlistCount");

    if(cartCount){
        cartCount.innerText = cart.length;
    }

    if(wishlistCount){
        wishlistCount.innerText = wishlist.length;
    }
}


// ===========================
// WISHLIST
// ===========================

function addWishlist(product) {

    wishlist.push(product);

    localStorage.setItem(
        "wishlist",
        JSON.stringify(wishlist)
    );

    updateCounters();

    alert(product + " added to wishlist!");
}

// ===========================
// CART
// ===========================

function addCart(product, price) {

    cart.push({
        product,
        price
    });

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    updateCounters();

    alert(product + " added to cart!");
}

// ===========================
// BUY NOW
// ===========================

function buyNow(product, price) {

    const popup =
        document.getElementById("paymentPopup");

    popup.style.display = "block";

    popup.setAttribute(
        "data-product",
        product
    );

    popup.setAttribute(
        "data-price",
        price
    );
}

// ===========================
// CLOSE POPUP
// ===========================

document
.getElementById("closePopup")
.addEventListener("click", () => {

    document
    .getElementById("paymentPopup")
    .style.display = "none";
});

// ===========================
// CLICK OUTSIDE POPUP
// ===========================

window.addEventListener("click", (e) => {

    const popup =
    document.getElementById("paymentPopup");

    if(e.target === popup){

        popup.style.display = "none";
    }
});
// ===========================
// COMMISSION PRICE
// ===========================

const sheetSize =
document.getElementById("sheetSize");

const medium =
document.getElementById("medium");

const commissionPrice =
document.getElementById("commissionPrice");

function calculateCommission() {

    const sizePrice =
    parseInt(sheetSize.value);

    const mediumPrice =
    parseInt(medium.value);

    const total =
    sizePrice + mediumPrice;

    commissionPrice.innerText =
    "Total : ₹" + total;
}
if(sheetSize && medium && commissionPrice){

    sheetSize.addEventListener(
        "change",
        calculateCommission
    );

    medium.addEventListener(
        "change",
        calculateCommission
    );

    calculateCommission();
}

// ===========================
// COMMISSION ORDER
// ===========================

function commissionOrder() {

    const total =
    parseInt(sheetSize.value)
    +
    parseInt(medium.value);

    document
    .getElementById("paymentPopup")
    .style.display = "block";

    alert(
        "Commission Price : ₹" + total
    );
}

// ===========================
// SUBMIT PAYMENT
// ===========================

const submitBtn =
document.getElementById("submitPayment");

submitBtn.addEventListener("click", function(){

    const screenshot =
    document.getElementById(
    "paymentScreenshot"
    );

    if(screenshot.files.length === 0){

        alert(
        "Please upload payment screenshot first."
        );

        return;
    }

    const popup =
document.getElementById("paymentPopup");

emailjs.send(
"service_t2hgt6w",
"template_9q28bu6",
{
product_name:
popup.getAttribute("data-product"),

product_id:
popup.getAttribute("data-product"),

sale_date:
new Date().toLocaleString(),

frame_type:
"Selected Option",

total_price:
popup.getAttribute("data-price"),

commission_details:
"Not a commission order"
}
)
.then(function(){

    alert(
    "Order submitted successfully!"
    );

    document
    .getElementById("paymentPopup")
    .style.display = "none";

})
.catch(function(error){

    console.error(error);

    alert(
    "Email notification failed."
    );
});


// ===========================
// FLOATING ART ROTATION
// ===========================

const container =
document.getElementById(
"floatingContainer"
);

let rotation = 0;


// ===========================
// TOUCH SWIPE
// ===========================

let touchStartY = 0;
let touchEndY = 0;

document.addEventListener(
"touchstart",
(e)=>{

    touchStartY =
    e.changedTouches[0].screenY;
}
);

document.addEventListener(
"touchend",
(e)=>{

    touchEndY =
    e.changedTouches[0].screenY;

    handleSwipe();
}
);

function handleSwipe(){

    // Swipe Up

    if(
      touchStartY - touchEndY > 50
    ){

        rotation += 30;

        container.style.transform =
        `rotate(${rotation}deg)`;
    }

    // Swipe Down

    else if(
      touchEndY - touchStartY > 50
    ){

        rotation -= 30;

        container.style.transform =
        `rotate(${rotation}deg)`;
    }
}

// ===========================
// MOUSE WHEEL SUPPORT
// ===========================

window.addEventListener(
"wheel",
(e)=>{

    if(e.deltaY < 0){

        rotation += 15;
    }

    else{

        rotation -= 15;
    }

    container.style.transform =
    `rotate(${rotation}deg)`;
});

// ===========================
// AUTO SAVE
// ===========================

window.addEventListener(
"beforeunload",
()=>{

    localStorage.setItem(
    "cart",
    JSON.stringify(cart)
    );

    localStorage.setItem(
    "wishlist",
    JSON.stringify(wishlist)
    );
});
document.addEventListener("DOMContentLoaded", () => {

    const video =
    document.getElementById("bgVideo");

    if(video){

        video.muted = true;

        video.play()
        .catch(error => {

            console.log(
            "Video autoplay blocked:",
            error
            );
        });
    }
});
function getDrawingPrice(groupName){

    const selected =
    document.querySelector(
    `input[name="${groupName}"]:checked`
    );

    return parseInt(selected.value);
};
