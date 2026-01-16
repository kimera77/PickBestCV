"use client";

import { useToast } from "@/hooks/use-toast";
import { logError } from "@/lib/errors";
import { useTranslation } from "@/hooks/use-translation";

export default function ContactFooter() {
  const { toast } = useToast();
  const { t } = useTranslation();

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
        {t('footer.haveSuggestions')}{" "}
        <button
          onClick={handleCopyEmail}
          className="underline font-semibold text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
        >
          {t('footer.contactUs')}
        </button>{" "}
        {t('footer.at')} quimserra7@gmail.com.
      </p>
    </footer>
  );
}
