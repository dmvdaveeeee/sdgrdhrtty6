const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Simple in-memory database
const productsDB = new Map();

// Test products
productsDB.set('1', {
    id: '1',
    name: 'Nike Dunk Low Panda',
    image: 'https://images.stockx.com/images/Nike-Dunk-Low-Retro-White-Black-2021-Product.jpg',
    currentPrice: 250,
    previousPrice: 240,
    platform: 'StockX',
    trend: 'up'
});

// API Routes
app.get('/api/products', (req, res) => {
    const products = Array.from(productsDB.values());
    res.json(products);
});

app.post('/api/products', (req, res) => {
    try {
        const { url, name } = req.body;
        const productId = Date.now().toString();
        
        const mockProduct = {
            id: productId,
            name: name || `Product from ${extractDomain(url)}`,
            url: url,
            currentPrice: Math.floor(Math.random() * 500) + 100,
            previousPrice: Math.floor(Math.random() * 500) + 100,
            platform: extractDomain(url),
            image: 'https://via.placeholder.com/150',
            createdAt: new Date().toISOString()
        };
        
        productsDB.set(productId, mockProduct);
        res.json(mockProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/products/:id', (req, res) => {
    const product = productsDB.get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
});

app.delete('/api/products/:id', (req, res) => {
    productsDB.delete(req.params.id);
    res.json({ message: 'Product deleted' });
});

app.post('/api/analyze', (req, res) => {
    const { products } = req.body;
    res.json({
        trend: "Market trending upward with 15% average increase",
        profitableItem: products?.[0]?.name || "Nike Dunk Low Panda",
        predictions: "Expected 10-20% growth next week",
        risks: "High competition for popular items",
        opportunities: "Limited edition releases coming soon",
        timestamp: new Date().toISOString()
    });
});

app.post('/api/scrape', (req, res) => {
    const { url } = req.body;
    res.json({
        name: `Product from ${extractDomain(url)}`,
        price: Math.floor(Math.random() * 500) + 100,
        platform: extractDomain(url),
        image: 'https://via.placeholder.com/150',
        availability: 'In Stock',
        lastUpdated: new Date().toISOString()
    });
});

// Serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Helper function
function extractDomain(url) {
    try {
        return new URL(url).hostname.replace('www.', '').split('.')[0];
    } catch {
        return 'Unknown';
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
    console.log(`🌐 Website at http://localhost:${PORT}`);
});
