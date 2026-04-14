const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const RETAILCRM_URL = process.env.RETAILCRM_URL;
const RETAILCRM_KEY = process.env.RETAILCRM_KEY;

// Функция для паузы (чтобы не превысить лимиты API)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function uploadOrders() {
    try {
        // 1. Читаем файл
        const rawData = fs.readFileSync('./mock_orders.json');
        const orders = JSON.parse(rawData);

        console.log(`Найдено заказов: ${orders.length}. Начинаю загрузку...`);

        for (const orderData of orders) {
            try {
                // RetailCRM API требует передавать данные в формате x-www-form-urlencoded
                // или через JSON в параметре 'order'
                const response = await axios.post(
                    `${RETAILCRM_URL}/api/v5/orders/create`,
                    new URLSearchParams({
                        apiKey: RETAILCRM_KEY,
                        order: JSON.stringify(orderData)
                    })
                );

                if (response.data.success) {
                    console.log(`✅ Заказ ${orderData.externalId || ''} успешно создан. ID: ${response.data.id}`);
                } else {
                    console.error(`❌ Ошибка создания:`, response.data.errors);
                }
            } catch (err) {
                console.error(`Ошибка при отправке заказа:`, err.response?.data || err.message);
            }

            // Небольшая задержка 200мс между запросами
            await sleep(200);
        }

        console.log('🚀 Загрузка завершена!');
    } catch (error) {
        console.error('Критическая ошибка:', error.message);
    }
}

uploadOrders();
