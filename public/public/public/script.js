const API_BASE_URL = '/api';
let priceChart = null;
let historyChart = null;
let trackedProducts = [];

document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    document.getElementById('trackBtn').addEventListener('click', trackProduct);
    document.getElementById('searchBtn').addEventListener('click', searchProduct);
    document.getElementById('refreshAll').addEventListener('click', refreshAllPrices);
    document.getElementById('exportData').addEventListener('click', exportData);
    initializeCharts();
});

function initializeCharts() {
    const priceCtx = document.getElementById('priceChart').getContext('2d');
    priceChart = new Chart(priceCtx, {
        type: 'doughnut',
        data: { labels: ['Profitable', 'Declining', 'Stable'], datasets: [{ data: [40, 30, 30], backgroundColor: ['#4cc9f0', '#f72585', '#7209b7'], borderWidth: 2, borderColor: '#fff' }] },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });

    const historyCtx = document.getElementById('historyChart').getContext('2d');
    historyChart = new Chart(historyCtx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Average Price', data: [], borderColor: '#4361ee', backgroundColor: 'rgba(67, 97, 238, 0.1)', borderWidth: 2, fill: true }] },
        options: { responsive: true, scales: { y: { beginAtZero: false, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { color: 'rgba(0,0,0,0.05)' } } } }
    });
}

async function loadProducts() {
    try {
        trackedProducts = [
            { id: 1, name: 'Nike Dunk Low Panda', image: 'https://images.stockx.com/images/Nike-Dunk-Low-Retro-White-Black-2021-Product.jpg?fit=fill&bg=FFFFFF&w=140&h=75&fm=webp&auto=compress&trim=color&dpr=2&updated_at=1623254186&q=60', currentPrice: 250, previousPrice: 240, platform: 'StockX', trend: 'up' },
            { id: 2, name: 'PlayStation 5 Digital', image: 'https://images.stockx.com/images/Sony-PlayStation-5-Digital-Edition-Product.jpg?fit=fill&bg=FFFFFF&w=140&h=75&fm=webp&auto=compress&trim=color&dpr=2&updated_at=1632941866&q=60', currentPrice: 450, previousPrice: 460, platform: 'eBay', trend: 'down' },
            { id: 3, name: 'iPhone 15 Pro', image: 'https://images.stockx.com/images/Apple-iPhone-15-Pro-256GB-Natural-Titanium-Product.jpg?fit=fill&bg=FFFFFF&w=140&h=75&fm=webp&auto=compress&trim=color&dpr=2&updated_at=1695932194&q=60', currentPrice: 1100, previousPrice: 1100, platform: 'GOAT', trend: 'stable' }
        ];
        renderProducts();
        updateAnalytics();
        generateAIInsights();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Failed to load products', 'danger');
    }
}

function renderProducts() {
    const tbody = document.getElementById('productsList');
    tbody.innerHTML = '';
    document.getElementById('productCount').textContent = `${trackedProducts.length} products`;
    
    trackedProducts.forEach(product => {
        const change = ((product.currentPrice - product.previousPrice) / product.previousPrice * 100).toFixed(2);
        const changeClass = change > 0 ? 'price-up' : change < 0 ? 'price-down' : 'price-stable';
        const trendIcon = product.trend === 'up' ? 'fa-arrow-up' : product.trend === 'down' ? 'fa-arrow-down' : 'fa-minus';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${product.image}" class="product-image" alt="${product.name}"><strong>${product.name}</strong><br><small class="text-muted">${product.platform}</small></td>
            <td><strong>$${product.currentPrice}</strong></td>
            <td class="${changeClass}"><i class="fas ${trendIcon}"></i> ${Math.abs(change)}%</td>
            <td><span class="badge ${product.trend === 'up' ? 'bg-success' : product.trend === 'down' ? 'bg-danger' : 'bg-secondary'}">${product.trend.toUpperCase()}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-info" onclick="viewProductDetails(${product.id})"><i class="fas fa-chart-line"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="removeProduct(${product.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function trackProduct() {
    const url = document.getElementById('productUrl').value.trim();
    if (!url) { showNotification('Please enter a product URL', 'warning'); return; }
    
    showNotification('Tracking product...', 'info');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newProduct = {
        id: Date.now(),
        name: `Product from ${extractDomain(url)}`,
        image: 'https://via.placeholder.com/50',
        currentPrice: Math.floor(Math.random() * 500) + 100,
        previousPrice: Math.floor(Math.random() * 500) + 100,
        platform: extractDomain(url),
        trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)]
    };
    
    trackedProducts.unshift(newProduct);
    renderProducts();
    updateAnalytics();
    document.getElementById('productUrl').value = '';
    showNotification('Product added!', 'success');
}

async function searchProduct() {
    const query = document.getElementById('productName').value.trim();
    if (!query) { showNotification('Please enter a product name', 'warning'); return; }
    
    showNotification(`Searching for "${query}"...`, 'info');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const modalBody = document.getElementById('productDetails');
    modalBody.innerHTML = `
        <h5>Search Results for "${query}"</h5>
        <div class="list-group mt-3">
            ${[1,2,3].map(i => `
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div><h6 class="mb-1">${query} - Option ${i}</h6><small class="text-muted">${['eBay','StockX','GOAT'][i-1]}</small></div>
                    <div><span class="badge bg-primary me-2">$${Math.floor(Math.random()*500)+100}</span>
                    <button class="btn btn-sm btn-success" onclick="addSearchResult('${query}', ${Math.floor(Math.random()*500)+100}, '${['eBay','StockX','GOAT'][i-1]}')"><i class="fas fa-plus"></i> Track</button></div>
                </div>
            `).join('')}
        </div>
    `;
    
    new bootstrap.Modal(document.getElementById('productModal')).show();
}

function addSearchResult(name, price, platform) {
    const newProduct = {
        id: Date.now(),
        name: name,
        image: 'https://via.placeholder.com/50',
        currentPrice: price,
        previousPrice: price * 0.9,
        platform: platform,
        trend: 'stable'
    };
    
    trackedProducts.unshift(newProduct);
    renderProducts();
    updateAnalytics();
    bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
    showNotification('Product added!', 'success');
}

function updateAnalytics() {
    if (!trackedProducts.length) return;
    
    const upCount = trackedProducts.filter(p => p.trend === 'up').length;
    const downCount = trackedProducts.filter(p => p.trend === 'down').length;
    const stableCount = trackedProducts.filter(p => p.trend === 'stable').length;
    
    priceChart.data.datasets[0].data = [upCount, downCount, stableCount];
    priceChart.update();
    
    const dates = [], prices = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today); date.setDate(date.getDate() - i);
        dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const avgPrice = trackedProducts.reduce((sum, p) => sum + p.currentPrice, 0) / trackedProducts.length;
        prices.push(Math.round(avgPrice + (Math.random() - 0.5) * 50));
    }
    
    historyChart.data.labels = dates;
    historyChart.data.datasets[0].data = prices;
    historyChart.update();
}

async function generateAIInsights() {
    await new Promise(resolve => setTimeout(resolve, 800));
    const insights = [
        "📈 <strong>Trend Alert:</strong> Sneaker prices up 15% this week. Consider selling!",
        "💰 <strong>Opportunity:</strong> PlayStation 5 prices dropping - good buy for resale.",
        "🎯 <strong>Prediction:</strong> Limited edition items likely to increase 20% next month."
    ];
    document.getElementById('aiInsight').innerHTML = insights[Math.floor(Math.random() * insights.length)];
}

function viewProductDetails(productId) {
    const product = trackedProducts.find(p => p.id === productId);
    if (!product) return;
    
    const modalBody = document.getElementById('productDetails');
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-4"><img src="${product.image}" class="img-fluid rounded" alt="${product.name}"></div>
            <div class="col-md-8">
                <h4>${product.name}</h4><p><strong>Platform:</strong> ${product.platform}</p>
                <p><strong>Current Price:</strong> $${product.currentPrice}</p>
                <p><strong>24h Change:</strong> <span class="${product.currentPrice > product.previousPrice ? 'price-up' : 'price-down'}">$${Math.abs(product.currentPrice - product.previousPrice)} (${((product.currentPrice - product.previousPrice)/product.previousPrice*100).toFixed(2)}%)</span></p>
                <hr><h6>Price Prediction (AI)</h6>
                <div class="alert alert-success"><i class="fas fa-brain"></i> Expected to ${product.trend === 'up' ? 'increase' : product.trend === 'down' ? 'decrease' : 'remain stable'} over next 7 days</div>
                <button class="btn btn-primary w-100" onclick="refreshPrice(${productId})"><i class="fas fa-sync"></i> Refresh Price</button>
            </div>
        </div>
    `;
    new bootstrap.Modal(document.getElementById('productModal')).show();
}

async function refreshPrice(productId) {
    const productIndex = trackedProducts.findIndex(p => p.id === productId);
    if (productIndex === -1) return;
    
    await new Promise(resolve => setTimeout(resolve, 500));
    const oldPrice = trackedProducts[productIndex].currentPrice;
    const newPrice = oldPrice + (Math.random() - 0.5) * 20;
    
    trackedProducts[productIndex].previousPrice = oldPrice;
    trackedProducts[productIndex].currentPrice = Math.round(newPrice);
    trackedProducts[productIndex].trend = newPrice > oldPrice ? 'up' : newPrice < oldPrice ? 'down' : 'stable';
    
    renderProducts();
    updateAnalytics();
    showNotification('Price updated!', 'success');
    const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
    if (modal) modal.hide();
}

async function refreshAllPrices() {
    showNotification('Refreshing all prices...', 'info');
    for (let product of trackedProducts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const newPrice = product.currentPrice + (Math.random() - 0.5) * 30;
        product.previousPrice = product.currentPrice;
        product.currentPrice = Math.round(Math.max(newPrice, 10));
        product.trend = newPrice > product.previousPrice ? 'up' : newPrice < product.previousPrice ? 'down' : 'stable';
    }
    renderProducts();
    updateAnalytics();
    showNotification('All prices updated!', 'success');
}

function removeProduct(productId) {
    if (confirm('Remove this product?')) {
        trackedProducts = trackedProducts.filter(p => p.id !== productId);
        renderProducts();
        updateAnalytics();
        showNotification('Product removed', 'warning');
    }
}

function exportData() {
    const dataStr = JSON.stringify(trackedProducts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resell-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Data exported!', 'success');
}

function extractDomain(url) {
    try { return new URL(url).hostname.replace('www.', '').split('.')[0]; } catch { return 'Unknown'; }
}

function showNotification(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = `top: 20px; right: 20px; z-index: 9999; min-width: 300px;`;
    alertDiv.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    document.body.appendChild(alertDiv);
    setTimeout(() => { if (alertDiv.parentNode) alertDiv.remove(); }, 5000);
}

window.viewProductDetails = viewProductDetails;
window.removeProduct = removeProduct;
window.refreshPrice = refreshPrice;
window.addSearchResult = addSearchResult;
