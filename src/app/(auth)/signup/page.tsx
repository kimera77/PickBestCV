import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrainCircuit } from "lucide-react";


export default function SignupPage() {
  return (
    <Card className="mx-auto max-w-sm shadow-xl">
      <CardHeader>
        <div className="flex flex-col items-center justify-center text-center gap-2 mb-4">
            <BrainCircuit className="h-10 w-10 text-primary" />
            <CardTitle className="text-3xl font-bold">CVMatch</CardTitle>
            <CardDescription className="text-balance">
              Introduce tus datos para crear una cuenta y empezar a analizar CVs
            </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first-name">Nombre</Label>
              <Input id="first-name" placeholder="Max" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-name">Apellidos</Label>
              <Input id="last-name" placeholder="Robinson" required />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" />
          </div>
          <Button type="submit" className="w-full font-semibold">
            Crear una cuenta
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Iniciar sesión
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
