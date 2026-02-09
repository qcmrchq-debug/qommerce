"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, Receipt, Settings, ArrowRightCircle, Moon, Sun, Menu } from "lucide-react"
import { useTheme } from "@/lib/theme-context"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const navigation = [
  { name: "Dashboard", href: "/client", icon: LayoutDashboard },
  { name: "My Invoices", href: "/client/invoices", icon: FileText },
  { name: "Paid Invoices", href: "/client/purchase-history", icon: ArrowRightCircle },
  { name: "Receipts", href: "/client/receipts", icon: Receipt },
  { name: "Settings", href: "/client/settings", icon: Settings },
]

function NavigationContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      <nav className="flex flex-1 flex-col gap-2 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="w-full justify-start gap-3 h-10 bg-transparent"
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
        </Button>
      </div>
    </>
  )
}

export function ClientSidebar() {
  return (
    <aside className="hidden w-64 border-r bg-card lg:flex lg:flex-col">
      <NavigationContent />
    </aside>
  )
}

export function ClientMobileMenu() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Main navigation menu</SheetDescription>
        </SheetHeader>
        <div className="flex h-full flex-col">
          <NavigationContent onNavigate={() => setMobileMenuOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
