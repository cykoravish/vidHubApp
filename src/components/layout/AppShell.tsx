import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

/** Phone-style frame: full screen on mobile, centered app card on desktop. */
export function AppShell() {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-100 via-brand-50 to-slate-200 md:flex md:items-center md:justify-center md:p-8">
      <div className="flex h-dvh w-full flex-col overflow-hidden bg-paper md:h-[780px] md:max-w-[430px] md:rounded-[2.25rem] md:shadow-[0_30px_80px_-20px_rgba(30,58,138,0.35)] md:ring-1 md:ring-slate-200">
        <main className="flex-1 overflow-y-auto overscroll-contain">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
