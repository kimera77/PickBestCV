"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";
import { clientHandleSignIn, clientHandleAnonymousSignIn } from "@/lib/auth/auth-provider";
import { Logo } from "@/components/logo";

const formSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

function getFirebaseErrorMessage(errorCode: string): string {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'Este correo electrónico ya está en uso por otra cuenta.';
        case 'auth/invalid-email':
            return 'El formato del correo electrónico no es válido.';
        case 'auth/operation-not-allowed':
            return 'El inicio de sesión con correo y contraseña no está habilitado.';
        case 'auth/weak-password':
            return 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
        case 'auth/user-disabled':
            return 'Este usuario ha sido deshabilitado.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Correo electrónico o contraseña incorrectos.';
        case 'auth/invalid-api-key':
            return 'Error de configuración de Firebase. Verifica las variables de entorno.';
        case 'unknown':
            return 'Error de conexión. Verifica tu configuración de Firebase.';
        default:
            return `Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo. Código: ${errorCode}`;
    }
}


export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isAnonymousLoading, setAnonymousLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError(null);
    try {
      await clientHandleSignIn(values.email, values.password);
      router.push("/dashboard");
    } catch (e: any) {
      setError(getFirebaseErrorMessage(e.code));
    }
  };

  const onAnonymousSubmit = async () => {
    setError(null);
    setAnonymousLoading(true);
    try { 
      console.log('🔵 Iniciando login anónimo...');
      const result = await clientHandleAnonymousSignIn();
      console.log('✅ Login anónimo exitoso:', result);
      console.log('🔄 Redirigiendo a dashboard...');
      router.push("/dashboard");
    } catch (e: any) {
      console.error('❌ Error en login anónimo:', e);
      const errorCode = e?.code || 'unknown';
      setError(getFirebaseErrorMessage(errorCode));
      setAnonymousLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-sm shadow-xl w-full">
      <CardHeader>
        <Link href="/" className="flex flex-col items-center justify-center text-center gap-2 mb-4">
          <Logo className="h-12 w-12" />
          <CardTitle className="text-3xl font-bold tracking-tighter">PickbestCV</CardTitle>
          <CardDescription className="text-balance">
            Introduce tu correo electrónico para acceder a tu cuenta
          </CardDescription>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder="m@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <FormLabel>Contraseña</FormLabel>
                      <Link
                        href="#"
                        className="ml-auto inline-block text-sm text-primary hover:underline"
                      >
                        ¿Has olvidado tu contraseña?
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full font-semibold" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Iniciar sesión
              </Button>
            </form>
          </Form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                O continuar con
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full font-semibold" onClick={onAnonymousSubmit} disabled={isAnonymousLoading}>
            {isAnonymousLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Entrar sin usuario
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
