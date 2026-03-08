import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendResetPasswordEmail } from '@/lib/email';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { message: 'Email inválido' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Don't reveal if user exists (security)
    if (!user || user.deletedAt) {
      return NextResponse.json(
        { message: 'Se este email existe, um link de reinicialização foi enviado' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // In production, send email here
    // For now, log the reset link for testing
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    console.log('🔐 Password reset link:', resetUrl);

    // Send reset email
    try {
      await sendResetPasswordEmail({
        email: user.email,
        resetUrl,
        userName: user.name,
      });
      console.log('✅ Reset email sent to', user.email);
    } catch (emailError) {
      console.error('❌ Failed to send reset email:', emailError);
      // Don't fail the request if email fails - in development this can happen
      if (process.env.NODE_ENV === 'production') {
        throw emailError;
      }
    }

    return NextResponse.json(
      { message: 'Email de reinicialização enviado' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Erro do servidor' },
      { status: 500 }
    );
  }
}
