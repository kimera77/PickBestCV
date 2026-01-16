"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import LanguageSwitcher from "@/components/dashboard/language-switcher";
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

function getFirebaseErrorMessage(errorCode: string, t: (key: any) => string): string {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return t('error.emailInUse');
        case 'auth/invalid-email':
            return t('error.invalidEmail');
        case 'auth/operation-not-allowed':
            return t('error.operationNotAllowed');
        case 'auth/weak-password':
            return t('error.weakPassword');
        case 'auth/user-disabled':
            return t('error.userDisabled');
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return t('error.wrongCredentials');
        case 'auth/invalid-api-key':
            return t('error.invalidApiKey');
        case 'unknown':
            return t('error.connectionError');
        default:
            return `${t('error.unexpected')} (${errorCode})`;
    }
}


export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isAnonymousLoading, setAnonymousLoading] = useState(false);

  const formSchema = z.object({
    email: z.string().email({ message: t('login.invalidEmail') }),
    password: z.string().min(6, { message: t('login.passwordTooShort') }),
  });

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
      setError(getFirebaseErrorMessage(e.code, t));
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
      setError(getFirebaseErrorMessage(errorCode, t));
      setAnonymousLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-sm shadow-xl w-full">
      <CardHeader>
        <div className="flex justify-end mb-2">
          <LanguageSwitcher />
        </div>
        <Link href="/" className="flex flex-col items-center justify-center text-center gap-2 mb-4">
          <Logo className="h-12 w-12" />
          <CardTitle className="text-3xl font-bold tracking-tighter">{t('login.title')}</CardTitle>
          <CardDescription className="text-balance">
            {t('login.description')}
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
                  <AlertTitle>{t('common.error')}</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('login.email')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('login.emailPlaceholder')} {...field} />
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
                      <FormLabel>{t('login.password')}</FormLabel>
                      <Link
                        href="#"
                        className="ml-auto inline-block text-sm text-primary hover:underline"
                      >
                        {t('login.forgotPassword')}
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
                {t('login.signIn')}
              </Button>
            </form>
          </Form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t('login.orContinueWith')}
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full font-semibold" onClick={onAnonymousSubmit} disabled={isAnonymousLoading}>
            {isAnonymousLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('login.signInAnonymous')}
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          {t('login.noAccount')}{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            {t('login.signUp')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
