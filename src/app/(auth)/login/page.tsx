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

export default function LoginPage() {
  return (
    <Card className="mx-auto max-w-sm shadow-xl">
      <CardHeader>
        <div className="flex flex-col items-center justify-center text-center gap-2 mb-4">
            <BrainCircuit className="h-10 w-10 text-primary" />
            <CardTitle className="text-3xl font-bold">CVMatch</CardTitle>
            <CardDescription className="text-balance">
              Introduce tu correo electrónico para acceder a tu cuenta
            </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
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
            <div className="flex items-center">
              <Label htmlFor="password">Contraseña</Label>
              <Link
                href="#"
                className="ml-auto inline-block text-sm text-primary hover:underline"
              >
                ¿Has olvidado tu contraseña?
              </Link>
            </div>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" className="w-full font-semibold">
            Iniciar sesión
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          ¿No tienes una cuenta?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Regístrate
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
