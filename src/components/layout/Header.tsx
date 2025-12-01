"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function Header() {
    const { setTheme, theme } = useTheme()
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/80 px-6 backdrop-blur-md transition-all">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-foreground tracking-tight">Overview</h1>
            </div>
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    className="text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors rounded-full"
                >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors rounded-full">
                    <Bell className="h-5 w-5" />
                </Button>
                <div className="h-6 w-px bg-border mx-1" />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-primary/10 hover:border-primary/30 transition-all p-0.5">
                            <Avatar className="h-full w-full">
                                <AvatarImage src="/avatars/01.png" alt="@rkm" />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">RK</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">RKM Admin</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    admin@rkmloom.com
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
