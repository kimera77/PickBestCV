"use client";

import { useToast } from "@/hooks/use-toast";
import { logError } from "@/lib/errors";

export default function ContactFooter() {
  const { toast } = useToast();

  const handleCopyEmail = () => {
    const email = "quimserra7@gmail.com";
    navigator.clipboard.writeText(email).then(() => {
      toast({
        title: "Correo copiado",
        description: "El correo electrónico ha sido copiado a tu portapapeles.",
      });
    }).catch(err => {
      logError(err, { action: 'copyEmail', email });
      toast({
        variant: "destructive",
        title: "Error al copiar",
        description: "No se pudo copiar el correo electrónico.",
      });
    });
  };

  return (
    <footer className="text-center p-4">
      <p className="text-xs text-muted-foreground opacity-75">
        Si tienes cualquier duda y quieres contactar conmigo, escríbeme{" "}
        <button
          onClick={handleCopyEmail}
          className="underline font-semibold text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
        >
          aquí
        </button>
        .
      </p>
    </footer>
  );
}
