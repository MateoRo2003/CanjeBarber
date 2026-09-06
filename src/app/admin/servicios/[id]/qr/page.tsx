import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BotonImprimir } from "@/components/boton-imprimir";
import { urlBase } from "@/lib/url-base";

export default async function QrServicioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");
  if (!session.user.isAdmin) redirect("/perfil");

  const { id } = await params;
  const servicio = await prisma.servicio.findUnique({ where: { id } });
  if (!servicio) notFound();

  const url = `${urlBase()}/sumar/${servicio.id}`;
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 480,
    margin: 2,
    color: { dark: "#1c1917", light: "#ffffff" },
  });

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center gap-4 px-6 py-10 text-center print:py-4">
      <p className="text-sm text-stone-500 print:hidden">
        <a href="/admin" className="underline">
          ← Volver al panel
        </a>
      </p>
      <h1 className="text-xl font-bold text-stone-900">{servicio.nombre}</h1>
      <p className="text-sm text-stone-500">
        +{servicio.puntosOtorgados} puntos
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrDataUrl}
        alt={`Código QR para sumar puntos de ${servicio.nombre}`}
        className="w-full max-w-xs rounded-xl border border-stone-200"
      />
      <p className="break-all text-xs text-stone-400">{url}</p>
      <p className="text-xs text-stone-400">
        Poné este QR solo en el mostrador — cualquiera que lo escanee suma
        estos puntos a su cuenta (máximo una vez por día).
      </p>
      <BotonImprimir />
    </main>
  );
}
