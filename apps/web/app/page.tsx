import { PrismaClient } from '@prisma/client';
import OrderChart from '@/components/OrderChart';

const prisma = new PrismaClient();

export default async function DashboardPage() {
  // Получаем заказы, сгруппированные по датам
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      createdAt: true,
      totalSum: true,
    }
  });

  // Преобразуем данные для графика (группировка по дням)
  const chartData = orders.reduce((acc: any[], order) => {
    const date = new Date(order.createdAt).toLocaleDateString('ru-RU');
    const existing = acc.find(item => item.date === date);

    if (existing) {
      existing.amount += Number(order.totalSum || 0);
      existing.count += 1;
    } else {
      acc.push({ date, amount: Number(order.totalSum || 0), count: 1 });
    }
    return acc;
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Аналитика заказов</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Выручка по дням</h2>
        <div className="h-[400px] w-full">
          <OrderChart data={chartData} />
        </div>
      </div>
    </div>
  );
}
