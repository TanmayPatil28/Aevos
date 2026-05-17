import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const exist = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (exist) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('CRITICAL: Registration failure in /api/register route.');
    console.error(
      'Error details:',
      error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : error
    );

    return NextResponse.json(
      { error: 'Something went wrong during registration. Please check the server logs.' },
      { status: 500 }
    );
  }
}
