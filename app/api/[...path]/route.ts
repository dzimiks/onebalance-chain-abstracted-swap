import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, API_KEY } from '@/lib/constants';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathString = path.join('/');
  const searchParams = request.nextUrl.searchParams;

  try {
    // Build the API URL with any query parameters
    const apiUrl = new URL(`/api/${pathString}`, API_BASE_URL);
    searchParams.forEach((value, key) => {
      apiUrl.searchParams.append(key, value);
    });

    const response = await fetch(apiUrl.toString(), {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
    });

    const data = await response.json();

    // Check if the response contains an error object and forward the status
    if (data.error && data.statusCode) {
      return NextResponse.json(data, { status: data.statusCode });
    }

    // Check for non-2xx status codes from the upstream API
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch data', error }, { status: 400 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathString = path.join('/');

  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/api/${pathString}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Check if the response contains an error object and forward the status
    if (data.error && data.statusCode) {
      return NextResponse.json(data, { status: data.statusCode });
    }

    // Check for non-2xx status codes from the upstream API
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch data', error }, { status: 400 });
  }
}
