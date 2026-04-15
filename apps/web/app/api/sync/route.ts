import { NextResponse } from 'next/server';
import path from 'path';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios from 'axios';

export async function GET() {
  try {
    // Вычисляем путь от корня текущего процесса
    // process.cwd() в dev-режиме и на Vercel указывает на apps/web
    const scriptPath = path.join(process.cwd(), '../../scripts/sync_orders.js');

    // Используем eval('require'), чтобы Turbopack не пытался импортировать файл при сборке
    const runtimeRequire = eval('require');
    const { syncOrders } = runtimeRequire(scriptPath);

    if (typeof syncOrders !== 'function') {
      throw new Error('syncOrders is not a function');
    }

    const count = await syncOrders();

    return NextResponse.json({
      success: true,
      processed: count
    });

  } catch (error: any) {
    console.error('Sync Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      // Поможет понять, где именно Node ищет файл
      path: path.join(process.cwd(), '../../scripts/sync_orders.js')
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
