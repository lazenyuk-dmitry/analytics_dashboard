const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
require('dotenv').config();

const prisma = new PrismaClient();

async function syncOrders() {
    try {
        console.log('Запрашиваю заказы из RetailCRM...');
        const response = await axios.get(`${process.env.RETAILCRM_URL}/api/v5/orders`, {
            params: { apiKey: process.env.RETAILCRM_KEY, limit: 100 }
        });

        const orders = response.data.orders;

        console.log(`Получено ${orders.length}. Синхронизирую с БД...`);

        // Используем транзакцию или цикл для upsert
        for (const o of orders) {
            await prisma.order.upsert({
                where: { id: BigInt(o.id) },
                update: {
                    status: o.status,
                    totalSum: o.totalSum,
                    customerName: `${o.firstName || ''} ${o.lastName || ''}`.trim()
                },
                create: {
                    id: BigInt(o.id),
                    externalId: o.externalId,
                    status: o.status,
                    totalSum: o.totalSum,
                    customerName: `${o.firstName || ''} ${o.lastName || ''}`.trim(),
                    createdAt: new Date(o.createdAt)
                }
            });
        }

        console.log('✅ Данные в Supabase обновлены через Prisma!');
    } catch (err) {
        console.error('❌ Ошибка Prisma:', err);
    } finally {
        await prisma.$disconnect();
    }
}

syncOrders();
