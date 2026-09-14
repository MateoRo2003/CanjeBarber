import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { auth } from "@/auth";
import { BotonImprimir } from "@/components/boton-imprimir";
import { AvisoActividad } from "@/components/aviso-actividad";
import { urlBase } from "@/lib/url-base";

// QR general del local: va pegado en la barbería o se comparte por
// redes/WhatsApp. Apunta siempre a la landing (dominio propio).
export default async function QrLocalPage() {
  const session = await auth();
  if (!session?.user) redirect("/");
  if (!session.user.isAdmin) redirect("/perfil");

  const url = urlBase();
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 480,
    margin: 2,
    color: { dark: "#0d330e", light: "#ffffff" },
  });

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center gap-4 px-6 py-10 text-center print:py-4">
      <AvisoActividad />
      <p className="text-sm text-muted-soft print:hidden">
        <a href="/admin" className="underline">
          ← Volver al panel
        </a>
      </p>
      <h1 className="text-xl font-bold text-foreground">QR general del local</h1>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrDataUrl}
        alt="Código QR para entrar al sistema de puntos"
        className="w-full max-w-xs rounded-xl border border-border"
      />
      <p className="break-all text-xs text-muted-faint">{url}</p>
      <BotonImprimir />
    </main>
  );
}
