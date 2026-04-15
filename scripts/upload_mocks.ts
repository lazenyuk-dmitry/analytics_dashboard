import fs from 'fs';
import path from 'path';
import { retailApi } from '@/lib/retailcrm';

interface MockOrder {
  externalId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  items: Array<{
    initialPrice: number;
    quantity: number;
    offer: { xmlId: string };
  }>;
  [key: string]: any;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function uploadOrders() {
  try {
    // Путь к файлу относительно корня проекта
    const filePath = path.resolve(process.cwd(), 'mock_orders.json');

    if (!fs.existsSync(filePath)) {
      throw new Error(`Файл не найден по пути: ${filePath}`);
    }

    const rawData = fs.readFileSync(filePath, 'utf-8');
    const orders: MockOrder[] = JSON.parse(rawData);

    console.log(`🚀 Найдено заказов: ${orders.length}. Начинаю загрузку в RetailCRM...`);

    for (const orderData of orders) {
      try {
        const response = await retailApi.post('/api/v5/orders/create',
          new URLSearchParams({
            order: JSON.stringify(orderData)
          })
        );

        if (response.data.success) {
          console.log(`✅ Заказ ${orderData.externalId || ''} создан. ID: ${response.data.id}`);
        } else {
          console.error(`❌ Ошибка API:`, response.data.errors);
        }
      } catch (err: any) {
        console.error(`Ошибка при отправке заказа ${orderData.externalId}:`, err.message);
      }

      // Пауза 200мс (RetailCRM имеет лимиты на кол-во запросов в секунду)
      await sleep(200);
    }

    console.log('🏁 Загрузка успешно завершена!');
  } catch (error: any) {
    console.error('Критическая ошибка загрузки:', error.message);
    process.exit(1);
  }
}

uploadOrders();
