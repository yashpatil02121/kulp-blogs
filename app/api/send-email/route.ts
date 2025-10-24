import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { profiles } from '@/lib/schema';
import { eq } from 'drizzle-orm';

async function refreshGoogleToken(refreshToken: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    expires_in: data.expires_in,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { to, from, subject, content, accessToken, refreshToken, provider, providerId } = await request.json();

    if (!to || !from || !subject || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (provider === 'google') {
      let currentAccessToken = accessToken;

      if (!currentAccessToken && refreshToken) {
        try {
          const refreshed = await refreshGoogleToken(refreshToken);
          currentAccessToken = refreshed.access_token;

          if (providerId) {
            const tokenExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000);
            await db
              .update(profiles)
              .set({
                access_token: currentAccessToken,
                token_expires_at: tokenExpiresAt,
                updated_at: new Date(),
              })
              .where(eq(profiles.provider_user_id, providerId));
          }
        } catch (error) {
          return NextResponse.json({ 
            error: 'Token expired. Please sign out and sign in again to grant email permissions.' 
          }, { status: 401 });
        }
      }

      if (!currentAccessToken) {
        return NextResponse.json({ 
          error: 'No valid access token. Please sign out and sign in again.' 
        }, { status: 401 });
      }

      const message = [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        '',
        content
      ].join('\n');

      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: encodedMessage,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        
        if (error.error?.message?.includes('Gmail API has not been used') || 
            error.error?.message?.includes('it is disabled') ||
            error.error?.details?.some((d: any) => d.reason === 'SERVICE_DISABLED')) {
          const activationUrl = error.error?.details?.find((d: any) => d['@type']?.includes('ErrorInfo'))?.metadata?.activationUrl;
          return NextResponse.json({ 
            error: 'Gmail API not enabled',
            message: 'The Gmail API must be enabled in your Google Cloud Console.',
            activationUrl: activationUrl || 'https://console.developers.google.com/apis/library/gmail.googleapis.com',
            details: error 
          }, { status: 503 });
        }
        
        if (error.error?.code === 403 || error.error?.code === 401) {
          if (refreshToken) {
            try {
              const refreshed = await refreshGoogleToken(refreshToken);
              currentAccessToken = refreshed.access_token;

              if (providerId) {
                const tokenExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000);
                await db
                  .update(profiles)
                  .set({
                    access_token: currentAccessToken,
                    token_expires_at: tokenExpiresAt,
                    updated_at: new Date(),
                  })
                  .where(eq(profiles.provider_user_id, providerId));
              }

              const retryResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${currentAccessToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  raw: encodedMessage,
                }),
              });

              if (!retryResponse.ok) {
                const retryError = await retryResponse.json();
                return NextResponse.json({ 
                  error: 'Please sign out and sign in again to grant Gmail send permission', 
                  details: retryError 
                }, { status: retryResponse.status });
              }

              return NextResponse.json({ success: true, message: 'Email sent successfully' });
            } catch (refreshError) {
              return NextResponse.json({ 
                error: 'Please sign out and sign in again to grant Gmail send permission' 
              }, { status: 401 });
            }
          }
          
          return NextResponse.json({ 
            error: 'Please sign out and sign in again to grant Gmail send permission', 
            details: error 
          }, { status: response.status });
        }

        return NextResponse.json({ error: 'Failed to send email', details: error }, { status: response.status });
      }

      return NextResponse.json({ success: true, message: 'Email sent successfully' });
    } else {
      return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

