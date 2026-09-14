import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BotonImprimir } from "@/components/boton-imprimir";
import { AvisoActividad } from "@/components/aviso-actividad";
import { urlBase } from "@/lib/url-base";

export default async function QrPremioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");
  if (!session.user.isAdmin) redirect("/perfil");

  const { id } = await params;
  const premio = await prisma.premio.findUnique({ where: { id } });
  if (!premio) notFound();

  const url = `${urlBase()}/canjear/${premio.id}`;
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
      <h1 className="text-xl font-bold text-foreground">{premio.nombre}</h1>
      <p className="text-sm text-muted-soft">{premio.puntosCosto} puntos</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrDataUrl}
        alt={`Código QR para canjear ${premio.nombre}`}
        className="w-full max-w-xs rounded-xl border border-border"
      />
      <p className="break-all text-xs text-muted-faint">{url}</p>
      <BotonImprimir />
    </main>
  );
}
