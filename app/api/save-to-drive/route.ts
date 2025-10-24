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
    const { title, content, author, createdAt, accessToken, refreshToken, provider, providerId } = await request.json();

    console.log('Save to Drive request:', { title, author, createdAt, provider, providerId, hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken });

    if (!title || !content) {
      return NextResponse.json({ error: 'Missing required fields: title and content are required' }, { status: 400 });
    }

    if (!provider || !providerId) {
      return NextResponse.json({ error: 'Missing authentication data: provider and providerId are required' }, { status: 400 });
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
            error: 'Token expired. Please sign out and sign in again to grant Drive permissions.'
          }, { status: 401 });
        }
      }

      if (!currentAccessToken) {
        return NextResponse.json({
          error: 'No valid access token. Please sign out and sign in again.'
        }, { status: 401 });
      }

      // Create plain text content for the blog post
      const textContent = `${title}

Author: ${author || 'Anonymous'}
Date: ${createdAt ? new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}

${content}`;

      // Create file metadata
      const fileMetadata = {
        name: `${title}.txt`,
        mimeType: 'text/plain',
        parents: ['root'] // Save to root directory, or you can specify a folder ID
      };

      // Create multipart request body
      const boundary = 'boundary_' + Math.random().toString(36).substr(2, 9);
      const delimiter = "\r\n--" + boundary + "\r\n";
      const closeDelimiter = "\r\n--" + boundary + "--";

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(fileMetadata) +
        delimiter +
        'Content-Type: text/plain\r\n\r\n' +
        textContent +
        closeDelimiter;

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentAccessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      });

      if (!response.ok) {
        const error = await response.json();

        if (error.error?.message?.includes('Drive API has not been used') ||
            error.error?.message?.includes('it is disabled') ||
            error.error?.details?.some((d: { reason?: string }) => d.reason === 'SERVICE_DISABLED')) {
          return NextResponse.json({
            error: 'Drive API not enabled',
            message: 'The Google Drive API must be enabled in your Google Cloud Console.',
            activationUrl: 'https://console.developers.google.com/apis/library/drive.googleapis.com',
            details: error
          }, { status: 503 });
        }

        if (error.error?.code === 403 || error.error?.code === 401) {
          // Check if it's a scope/permission issue
          if (error.error?.message?.includes('insufficientPermissions') ||
              error.error?.message?.includes('insufficient authentication scopes') ||
              error.error?.details?.some((d: { reason?: string }) => d.reason === 'ACCESS_TOKEN_SCOPE_INSUFFICIENT')) {
            return NextResponse.json({
              error: 'Drive permissions required. Please sign out and sign in again to grant Google Drive access.',
              details: error
            }, { status: response.status });
          }

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

              const retryResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${currentAccessToken}`,
                  'Content-Type': `multipart/related; boundary=${boundary}`,
                },
                body: multipartRequestBody,
              });

              if (!retryResponse.ok) {
                const retryError = await retryResponse.json();
                // Check if retry also fails with scope issue
                if (retryError.error?.message?.includes('insufficientPermissions') ||
                    retryError.error?.message?.includes('insufficient authentication scopes') ||
                    retryError.error?.details?.some((d: { reason?: string }) => d.reason === 'ACCESS_TOKEN_SCOPE_INSUFFICIENT')) {
                  return NextResponse.json({
                    error: 'Drive permissions required. Please sign out and sign in again to grant Google Drive access.',
                    details: retryError
                  }, { status: retryResponse.status });
                }
                return NextResponse.json({
                  error: 'Please sign out and sign in again to grant Drive permissions',
                  details: retryError
                }, { status: retryResponse.status });
              }

              const retryResult = await retryResponse.json();
              return NextResponse.json({
                success: true,
                message: 'Blog saved to Google Drive successfully',
                fileId: retryResult.id,
                fileUrl: `https://drive.google.com/file/d/${retryResult.id}/view`
              });
            } catch (refreshError) {
              return NextResponse.json({
                error: 'Please sign out and sign in again to grant Drive permissions'
              }, { status: 401 });
            }
          }

          return NextResponse.json({
            error: 'Please sign out and sign in again to grant Drive permissions',
            details: error
          }, { status: response.status });
        }

        return NextResponse.json({ error: 'Failed to save to Drive', details: error }, { status: response.status });
      }

      const result = await response.json();
      return NextResponse.json({
        success: true,
        message: 'Blog saved to Google Drive successfully',
        fileId: result.id,
        fileUrl: `https://drive.google.com/file/d/${result.id}/view`
      });
    } else {
      return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error saving to drive:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
