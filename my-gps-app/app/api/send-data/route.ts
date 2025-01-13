import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const response = await fetch('http://51.12.244.144:8000/send_position', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        user: body.user,
        x: body.x,
        z: body.z,
        angle: body.angle
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to send position data' },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: 'Data sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}