import { prisma } from '@/lib/prisma';
import { retailApi } from '@/lib/retailcrm';
import { RetailOrder } from '@/types/retailcrm/entities';

export async function syncOrders(): Promise<number> {
  try {
    console.log("Запрашиваю заказы из RetailCRM...");

    const { data } = await retailApi.get<{ orders: RetailOrder[] }>('/api/v5/orders', {
      params: { limit: 100 } // apiKey уже в конфиге
    });

    const orders = data.orders;
    console.log(`Получено ${orders.length}. Подготовка транзакции...`);

    const operations = orders.map((o) => {
      const orderId = BigInt(o.id);
      const customerName = `${o.firstName || ""} ${o.lastName || ""}`.trim();

      return prisma.order.upsert({
        where: { id: orderId },
        update: {
          status: o.status,
          totalSum: o.totalSumm,
          customerName
        },
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
  } catch (err: any) {
    console.error("❌ Sync error:", err.response?.data || err.message);
    throw err;
  }
}

// Позволяет запускать файл напрямую через tsx или ts-node
if (require.main === module) {
  syncOrders()
    .then((c) => {
      console.log(`✅ Done: ${c}`);
      process.exit(0);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
