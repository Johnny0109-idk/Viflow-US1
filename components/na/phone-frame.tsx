import { BottomNav } from '@/components/na/bottom-nav'
import { DemoGuide } from '@/components/na/demo-guide'

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-yellow sm:p-6">
      <div className="flex h-dvh w-full flex-col overflow-hidden bg-cream sm:h-[min(844px,calc(100dvh-48px))] sm:w-[390px] sm:rounded-[40px] sm:border-[2.5px] sm:border-ink sm:shadow-hard">
        <main className="relative min-h-0 flex-1">
          {children}
          <DemoGuide />
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
