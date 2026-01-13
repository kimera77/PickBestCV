import Link from "next/link";
import {
  CircleUser,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LanguageSwitcher from "./language-switcher";
import { clientHandleSignOut } from "@/lib/auth/auth-provider";
import { UserAvatar } from "./user-avatar";
import { Logo } from "@/components/logo";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useRouter } from "next/navigation";


export default function Header() {
  const router = useRouter();

  const handleSignOut = async () => {
    await clientHandleSignOut();
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
        <Link
          href="#"
          className="flex items-center gap-2 font-semibold"
        >
          <Logo className="h-7 w-7" />
          <span className="font-bold text-xl tracking-tight">PickbestCV</span>
        </Link>
        
        <Sheet>
            <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
            </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
            <SheetHeader className="sr-only">
              <SheetTitle>Menú principal</SheetTitle>
              <SheetDescription>Navegación principal del sitio</SheetDescription>
            </SheetHeader>
            <nav className="grid gap-6 text-lg font-medium">
                <Link
                href="#"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">PickbestCV</span>
                </Link>
                <Link
                href="#"
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                Dashboard
                </Link>
                <Link
                href="#"
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                Ajustes
                </Link>
            </nav>
            </SheetContent>
        </Sheet>

      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial" />
        <LanguageSwitcher />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <UserAvatar />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem>Ajustes</DropdownMenuItem>
            <DropdownMenuSeparator />
             <DropdownMenuItem onClick={handleSignOut}>
                Cerrar sesión
              </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
