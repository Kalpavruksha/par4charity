import { ReactNode } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()

    if (!profile?.is_admin) {
        redirect('/dashboard')
    }

    return (
        <div className="app-layout">
            <AdminSidebar />
            <main className="main-content">
                {children}
            </main>
        </div>
    )
}
