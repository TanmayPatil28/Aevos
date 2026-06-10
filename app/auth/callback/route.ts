import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // Handle OAuth provider errors
  if (error) {
    return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(error_description || error)}`)
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (sessionError) {
      return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(sessionError.message)}`)
    }
    
    // Successfully authenticated, redirect to the next URL
    return NextResponse.redirect(`${origin}${next}`)
  }

  // If no code is present, redirect to the auth page with an error
  return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent('Authentication code missing. Please try again.')}`)
}
