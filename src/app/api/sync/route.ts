import { NextResponse } from 'next/server';
import { syncOrders } from '@scripts/sync_orders';

export async function GET() {
  try {
    const count = await syncOrders();

    return NextResponse.json({
      success: true,
      message: `Синхронизация завершена. Обработано заказов: ${count}`
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
