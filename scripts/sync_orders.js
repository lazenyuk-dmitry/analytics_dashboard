const { PrismaClient } = require("@prisma/client");
const axios = require("axios");

// Используем глобальную переменную для Prisma, чтобы не плодить коннекты
let prisma;

async function syncOrders() {
  if (!prisma) prisma = new PrismaClient();

  try {
    console.log("Запрашиваю заказы из RetailCRM...");
    const response = await axios.get(
      `${process.env.RETAILCRM_URL}/api/v5/orders`,
      { params: { apiKey: process.env.RETAILCRM_KEY, limit: 100 } }
    );

    const orders = response.data.orders;
    const operations = orders.map((o) => {
      const orderId = BigInt(o.id);
      const customerName = `${o.firstName || ""} ${o.lastName || ""}`.trim();
      return prisma.order.upsert({
        where: { id: orderId },
        update: { status: o.status, totalSum: o.totalSumm, customerName },
        create: {
          id: orderId,
          externalId: o.externalId,
          status: o.status,
          totalSum: o.totalSumm,
          customerName,
          createdAt: new Date(o.createdAt),
        },
      });
    });

    const results = await prisma.$transaction(operations);
    return results.length;
  } catch (err) {
    console.error("❌ Sync error:", err.message);
    throw err;
  }
}

// Экспорт для Next.js
module.exports = { syncOrders };

// Запуск для консоли
if (require.main === module) {
  require("dotenv").config();
  syncOrders()
    .then((c) => {
      console.log(`Done: ${c}`);
      process.exit(0);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
