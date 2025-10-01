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
import { handleSignUp } from "@/lib/auth/actions";
import { Logo } from "@/components/logo";


const formSchema = z.object({
  firstName: z.string().min(1, { message: "El nombre es obligatorio." }),
  lastName: z.string().min(1, { message: "Los apellidos son obligatorios." }),
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError(null);
    const result = await handleSignUp(values);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <Card className="mx-auto max-w-sm shadow-xl w-full">
      <CardHeader>
        <Link href="/" className="flex flex-col items-center justify-center text-center gap-2 mb-4">
            <Logo className="h-12 w-12" />
            <CardTitle className="text-3xl font-bold tracking-tighter">PickbestCV</CardTitle>
            <CardDescription className="text-balance">
              Introduce tus datos para crear una cuenta y empezar a analizar CVs
            </CardDescription>
        </Link>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
             {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error de registro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Max" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellidos</FormLabel>
                    <FormControl>
                      <Input placeholder="Robinson" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full font-semibold" disabled={form.formState.isSubmitting}>
               {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear una cuenta
            </Button>
          </form>
        </Form>
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
