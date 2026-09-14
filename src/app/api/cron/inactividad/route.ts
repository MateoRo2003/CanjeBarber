import { NextRequest, NextResponse } from "next/server";
import { aplicarPenalizacionesInactividad } from "@/lib/inactividad";

// Vercel Cron llama a esto una vez al día (ver vercel.json en la raíz del
// repo). Protegido con CRON_SECRET para que nadie más pueda dispararlo
// desde afuera y hacer que se le descuenten puntos a los clientes por su
// cuenta — Vercel manda ese secreto solo en las llamadas que arranca su
// propio cron (https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs).
//
// Si CRON_SECRET no está configurado en las variables de entorno, esto
// rechaza TODO pedido (falla cerrado, no abierto).
export async function GET(request: NextRequest) {
  const secreto = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secreto || auth !== `Bearer ${secreto}`) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const resultado = await aplicarPenalizacionesInactividad();
  return NextResponse.json(resultado);
}
