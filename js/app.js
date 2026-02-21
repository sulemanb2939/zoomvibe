document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    const navbar = document.querySelector('.navbar');

    const productsGrid = document.getElementById('productsGrid');
    const brandFilter = document.getElementById('brandFilter');
    const filterBtns = document.querySelectorAll('.btn-filter');

    const cartBtn = document.getElementById('cartBtn');
    const cartBtnMobile = document.getElementById('cartBtnMobile');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const cartCountSpans = document.querySelectorAll('.cart-count');
    const cartCheckoutBtn = document.getElementById('cartCheckoutBtn');
    const continueShoppingBtn = document.getElementById('continueShoppingBtn');

    const previewModal = document.getElementById('previewModal');
    const closePreviewBtn = document.getElementById('closePreviewBtn');
    const previewImage = document.getElementById('previewImage');
    const previewTitle = document.getElementById('previewTitle');
    const previewBrand = document.getElementById('previewBrand');
    const previewPrice = document.getElementById('previewPrice');
    const previewSizesGrid = document.getElementById('previewSizesGrid');
    const previewErrorMsg = document.getElementById('previewErrorMsg');
    const previewAddToCartBtn = document.getElementById('previewAddToCartBtn');
    const previewOrderBtn = document.getElementById('previewOrderBtn');

    // --- State Variables ---
    let cart = JSON.parse(localStorage.getItem('zoomvibe_cart')) || [];
    let currentFilteredProducts = [...products];
    let selectedPreviewProduct = null;
    let selectedSize = null;

    const WA_NUMBER = "923040022244";

    // --- Initialization ---
    init();

    function init() {
        renderProducts(currentFilteredProducts);
        updateCartUI();
        setupEventListeners();

        // Use hero image as fallback for all products for now if they don't exist
        document.querySelectorAll('.product-img').forEach(img => {
            img.addEventListener('error', function () {
                this.src = 'assets/hero-sneaker.png';
            });
        });
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        // Mobile Menu
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.querySelector('i').classList.toggle('fa-times');
            mobileMenuBtn.querySelector('i').classList.toggle('fa-bars');
        });

        // Sticky Navbar Effect
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(15, 15, 15, 0.95)';
                navbar.style.boxShadow = '0 5px 20px rgba(0,0,0,0.5)';
            } else {
                navbar.style.background = 'rgba(0, 0, 0, 0.8)';
                navbar.style.boxShadow = 'none';
            }
        });

        // Cart Toggles
        cartBtn.addEventListener('click', () => cartOverlay.classList.add('active'));
        cartBtnMobile.addEventListener('click', () => {
            cartOverlay.classList.add('active');
            navLinks.classList.remove('active'); // Close mobile menu if open
        });
        closeCartBtn.addEventListener('click', () => cartOverlay.classList.remove('active'));
        continueShoppingBtn.addEventListener('click', () => cartOverlay.classList.remove('active'));

        // Close modals when clicking outside
        cartOverlay.addEventListener('click', (e) => {
            if (e.target === cartOverlay) cartOverlay.classList.remove('active');
        });
        previewModal.addEventListener('click', (e) => {
            if (e.target === previewModal) closeModal();
        });
        closePreviewBtn.addEventListener('click', closeModal);

        // Filters
        brandFilter.addEventListener('change', applyFilters);
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                applyFilters();
            });
        });

        // Cart Actions
        cartCheckoutBtn.addEventListener('click', checkoutCartWhatsApp);

        // Preview Actions
        previewAddToCartBtn.addEventListener('click', () => {
            if (selectedSize) {
                addToCart(selectedPreviewProduct, selectedSize);
                closeModal();
                cartOverlay.classList.add('active');
            } else {
                previewErrorMsg.style.display = 'block';
            }
        });

        previewOrderBtn.addEventListener('click', () => {
            if (selectedSize) {
                orderSingleWhatsApp(selectedPreviewProduct, selectedSize);
            } else {
                previewErrorMsg.style.display = 'block';
            }
        });
    }

    // --- Product Rendering & Filtering ---
    function applyFilters() {
        const brand = brandFilter.value;
        const activeSortBtn = document.querySelector('.btn-filter.active');
        const sortType = activeSortBtn.dataset.filter;

        currentFilteredProducts = products.filter(p => {
            const brandMatch = brand === 'all' || p.brand === brand;
            let typeMatch = true;
            if (sortType === 'bestseller') typeMatch = p.isBestseller;
            if (sortType === 'new') typeMatch = p.isNew;

            return brandMatch && typeMatch;
        });

        // Add small animation delay for visual feedback
        productsGrid.style.opacity = 0;
        setTimeout(() => {
            renderProducts(currentFilteredProducts);
            productsGrid.style.opacity = 1;
            productsGrid.style.transition = 'opacity 0.3s ease';
        }, 200);
    }

    function renderProducts(items) {
        productsGrid.innerHTML = '';
        if (items.length === 0) {
            productsGrid.innerHTML = `<p style="text-align:center; grid-column: 1/-1; color: var(--text-secondary);">No products found matching your filters.</p>`;
            return;
        }

        items.forEach(product => {
            // Badges HTML
            let badgesHtml = '';
            if (product.isNew) badgesHtml += `<span class="badge-condition" style="background: rgba(0, 174, 239, 0.2); color: #00AEEF;">New Arrival</span>`;
            else if (product.isBestseller) badgesHtml += `<span class="badge-condition" style="background: rgba(255, 215, 0, 0.2); color: gold;">Bestseller</span>`;

            // Size Chips HTML
            const sizesHtml = product.sizes.map(size =>
                `<div class="size-chip" data-size="${size}">${size}</div>`
            ).join('');

            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-badges">
                    <span class="badge-brand">${product.brand}</span>
                    <span class="badge-condition">${product.condition}</span>
                    ${badgesHtml}
                </div>
                <div class="product-img-container" onclick="window.openPreview(${product.id})">
                    <img src="${product.image}" alt="${product.name}" class="product-img" onerror="this.src='assets/hero-sneaker.png'">
                </div>
                <div class="product-info">
                    <h3 class="product-title" onclick="window.openPreview(${product.id})">${product.name}</h3>
                    <p class="product-price">Rs. ${product.price.toLocaleString()}</p>
                    
                    <div class="size-selection">
                        <p>UK Sizes Available:</p>
                        <div class="sizes-container size-group-${product.id}">
                            ${sizesHtml}
                        </div>
                    </div>
                    
                    <p class="error-msg error-${product.id}">Please select a size first.</p>
                    
                    <div class="card-actions">
                        <button class="btn btn-outline card-add-btn disabled" data-id="${product.id}">Add to Cart</button>
                        <button class="btn btn-primary glow-effect card-order-btn disabled" data-id="${product.id}">
                            <i class="fab fa-whatsapp"></i> Order on WhatsApp
                        </button>
                    </div>
                </div>
            `;
            productsGrid.appendChild(card);

            // Setup size selection within the card
            setupCardSizeSelection(card, product.id);
        });

        // Setup direct card action buttons after render
        setupCardActionButtons();
    }

    function setupCardSizeSelection(cardNode, productId) {
        const sizeChips = cardNode.querySelectorAll('.size-chip');
        const addBtn = cardNode.querySelector('.card-add-btn');
        const orderBtn = cardNode.querySelector('.card-order-btn');
        const errorMsg = cardNode.querySelector('.error-msg');

        // Find product
        const product = products.find(p => p.id === productId);

        // Card local state
        let cardSelectedSize = null;

        sizeChips.forEach(chip => {
            chip.addEventListener('click', () => {
                // Clear others
                sizeChips.forEach(c => c.classList.remove('selected'));
                // Select this
                chip.classList.add('selected');
                cardSelectedSize = chip.dataset.size;

                // Enable buttons
                addBtn.classList.remove('disabled');
                orderBtn.classList.remove('disabled');
                errorMsg.style.display = 'none';

                // Attach the currently selected size to the button datasets
                addBtn.dataset.selectedSize = cardSelectedSize;
                orderBtn.dataset.selectedSize = cardSelectedSize;
            });
        });
    }

    function setupCardActionButtons() {
        document.querySelectorAll('.card-add-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (btn.classList.contains('disabled')) return;
                const id = parseInt(btn.dataset.id);
                const size = btn.dataset.selectedSize;
                const product = products.find(p => p.id === id);
                addToCart(product, size);

                // Visual feedback
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> Added';
                btn.style.borderColor = 'var(--accent-green)';
                btn.style.color = 'var(--accent-green)';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.borderColor = '';
                    btn.style.color = '';
                }, 2000);
            });
        });

        document.querySelectorAll('.card-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (btn.classList.contains('disabled')) return;
                const id = parseInt(btn.dataset.id);
                const size = btn.dataset.selectedSize;
                const product = products.find(p => p.id === id);
                orderSingleWhatsApp(product, size);
            });
        });
    }

    // --- Modal Logic ---
    window.openPreview = (productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        selectedPreviewProduct = product;
        selectedSize = null;

        previewTitle.textContent = product.name;
        previewBrand.textContent = product.brand;
        previewPrice.textContent = `Rs. ${product.price.toLocaleString()}`;
        previewImage.src = product.image;

        // Reset state
        previewErrorMsg.style.display = 'none';
        previewAddToCartBtn.classList.add('disabled');
        previewOrderBtn.classList.add('disabled');

        // Populate sizes
        previewSizesGrid.innerHTML = product.sizes.map(size =>
            `<div class="size-chip" data-size="${size}">${size}</div>`
        ).join('');

        // Size click events for modal
        const modalSizeChips = previewSizesGrid.querySelectorAll('.size-chip');
        modalSizeChips.forEach(chip => {
            chip.addEventListener('click', () => {
                modalSizeChips.forEach(c => c.classList.remove('selected'));
                chip.classList.add('selected');
                selectedSize = chip.dataset.size;

                previewAddToCartBtn.classList.remove('disabled');
                previewOrderBtn.classList.remove('disabled');
                previewErrorMsg.style.display = 'none';
            });
        });

        previewModal.classList.add('active');
    };

    function closeModal() {
        previewModal.classList.remove('active');
    }

    // --- Cart System ---
    function addToCart(product, size) {
        // Check if same item + size exists
        const existingItemIndex = cart.findIndex(item => item.id === product.id && item.size === size);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({
                ...product,
                size: size,
                quantity: 1,
                cartItemId: Date.now() + Math.random().toString(36).substr(2, 9)
            });
        }

        saveCart();
        updateCartUI();
    }

    window.removeFromCart = (cartItemId) => {
        cart = cart.filter(item => item.cartItemId !== cartItemId);
        saveCart();
        updateCartUI();
    };

    function saveCart() {
        localStorage.setItem('zoomvibe_cart', JSON.stringify(cart));
    }

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Update counters
        cartCountSpans.forEach(span => span.textContent = totalItems);
        cartTotalPrice.textContent = `Rs. ${totalPrice.toLocaleString()}`;

        // Update drawer HTML
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<div class="empty-cart-msg">Your cart is empty. Let's find some kicks!</div>`;
            cartCheckoutBtn.classList.add('disabled');
            return;
        }

        cartCheckoutBtn.classList.remove('disabled');

        cart.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='assets/hero-sneaker.png'">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-meta">
                        <span>UK Size: ${item.size}</span>
                        <span>Qty: ${item.quantity}</span>
                    </div>
                    <div class="cart-item-price">Rs. ${(item.price * item.quantity).toLocaleString()}</div>
                    <button class="remove-item" onclick="window.removeFromCart('${item.cartItemId}')">Remove</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });
    }

    // --- WhatsApp Order Flow ---
    function orderSingleWhatsApp(product, size) {
        /*
        WhatsApp link format:
        https://wa.me/923040022244?text=
        Product Name:
        Selected Size:
        Price:
        Customer wants to order this item.
        */
        const text = `*New Order - ZoomVibe*\n\n*Product Name:* ${product.name}\n*Condition:* ${product.condition}\n*Selected Size:* UK ${size}\n*Price:* Rs. ${product.price.toLocaleString()}\n\nCustomer wants to order this item.`;

        const encodedText = encodeURIComponent(text);
        const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodedText}`;
        window.open(waUrl, '_blank');
    }

    function checkoutCartWhatsApp() {
        if (cart.length === 0) return;

        let text = `*New Cart Order - ZoomVibe*\n\n`;
        let totalPrice = 0;

        cart.forEach((item, index) => {
            text += `*Item ${index + 1}:* ${item.name}\n`;
            text += `- Size: UK ${item.size}\n`;
            text += `- Quantity: ${item.quantity}\n`;
            text += `- Price: Rs. ${(item.price * item.quantity).toLocaleString()}\n\n`;
            totalPrice += (item.price * item.quantity);
        });

        text += `*Total Order Value:* Rs. ${totalPrice.toLocaleString()}\n\nCustomer wants to order these items.`;

        const encodedText = encodeURIComponent(text);
        const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodedText}`;
        window.open(waUrl, '_blank');
    }
});
