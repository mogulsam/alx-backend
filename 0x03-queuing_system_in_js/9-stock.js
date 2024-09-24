import express from 'express';
import { createClient } from 'redis';
import { promisify } from 'util';

const app = express();
const port = 1245;

// Redis client setup
const redisClient = createClient();
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);

// Product list
const listProducts = [
    { itemId: 1, itemName: 'Suitcase 250', price: 50, initialAvailableQuantity: 4 },
    { itemId: 2, itemName: 'Suitcase 450', price: 100, initialAvailableQuantity: 10 },
    { itemId: 3, itemName: 'Suitcase 650', price: 350, initialAvailableQuantity: 2 },
    { itemId: 4, itemName: 'Suitcase 1050', price: 550, initialAvailableQuantity: 5 },
];

// Get item by ID
function getItemById(id) {
    return listProducts.find((item) => item.itemId === id);
}

// Reserve stock by ID
function reserveStockById(itemId, stock) {
    return setAsync(`item.${itemId}`, stock);
}

// Get current reserved stock by ID
async function getCurrentReservedStockById(itemId) {
    const stock = await getAsync(`item.${itemId}`);
    return stock ? parseInt(stock) : 0;
}

// GET /list_products
app.get('/list_products', (req, res) => {
    res.json(listProducts);
});

// GET /list_products/:itemId
app.get('/list_products/:itemId', async (req, res) => {
    const itemId = parseInt(req.params.itemId);
    const item = getItemById(itemId);

    if (!item) {
        res.status(404).json({ status: 'Product not found' });
        return;
    }

    const currentQuantity = await getCurrentReservedStockById(itemId);
    res.json({ ...item, currentQuantity });
});

// GET /reserve_product/:itemId
app.get('/reserve_product/:itemId', async (req, res) => {
    const itemId = parseInt(req.params.itemId);
    const item = getItemById(itemId);

    if (!item) {
        res.status(404).json({ status: 'Product not found' });
        return;
    }

    const currentQuantity = await getCurrentReservedStockById(itemId);
    if (currentQuantity >= item.initialAvailableQuantity) {
        res.json({ status: 'Not enough stock available', itemId });
        return;
    }

    await reserveStockById(itemId, currentQuantity + 1);
    res.json({ status: 'Reservation confirmed', itemId });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
