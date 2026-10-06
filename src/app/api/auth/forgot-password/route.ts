import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendResetPasswordEmail } from '@/lib/email';
import { checkRouteRateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';

export const runtime = 'nodejs';

// Réponse identique que le compte existe ou non, pour ne pas permettre d'énumérer les emails
const GENERIC_RESPONSE = { message: 'Se este email existe, um link de reinicialização foi enviado' };

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRouteRateLimit(request, 'passwordReset');
    if (rateLimitResponse) return rateLimitResponse;

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

    if (!user || user.deletedAt) {
      return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    // Jamais en production : le lien contient un token valide pour prendre le compte
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Password reset link:', resetUrl);
    }

    // Send reset email
    try {
      await sendResetPasswordEmail({
        email: user.email,
        resetUrl,
        userName: user.name,
      });
      console.log('✅ Reset email sent');
    } catch (emailError) {
      console.error('❌ Failed to send reset email:', emailError);
      // Don't fail the request if email fails - in development this can happen
      if (process.env.NODE_ENV === 'production') {
        throw emailError;
      }
    }

    return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Erro do servidor' },
      { status: 500 }
    );
  }
}
