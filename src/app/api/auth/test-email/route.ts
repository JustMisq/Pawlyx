import { NextRequest, NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { message: 'Endpoint disponível apenas em desenvolvimento' },
        { status: 403 }
      );
    }

    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { message: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    await sendTestEmail(email);

    return NextResponse.json(
      { message: 'Email de teste enviado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { message: 'Erro ao enviar email de teste', error: String(error) },
      { status: 500 }
    );
  }
}
