import { ReactNode } from 'react'
import DashboardSidebar from '@/components/DashboardSidebar'

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="app-layout">
            <DashboardSidebar />
            <main className="main-content">
                {children}
            </main>
        </div>
    )
}
