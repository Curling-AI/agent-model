import { createServerClient } from '@supabase/ssr'
export async function createClient() {
  // const cookieStore = await cookies()
  // const createClient = createServerClient(
  //   process.env.SUPABASE_URL!,
  //   process.env.SUPABASE_ANON_KEY!,
  //   {
  //     cookies: {
  //       getAll() {
  //         return cookieStore.getAll()
  //       },
  //       setAll(cookiesToSet) {
  //         try {
  //           cookiesToSet.forEach(({ name, value, options }) =>
  //             cookieStore.set(name, value, options),
  //           )
  //         } catch {}
  //       },
  //     },
  //   },
  // )

  // createClient.auth.setSession({
  //   access_token: cookieStore.get('sb-access-token')?.value || '',
  //   refresh_token: cookieStore.get('sb-refresh-token')?.value || '',
  // })

  // return createClient
}
