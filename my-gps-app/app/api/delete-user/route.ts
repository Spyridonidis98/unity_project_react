import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    if (!body.user) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`http://51.12.244.144:8000/delete_user`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        user: body.user
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}