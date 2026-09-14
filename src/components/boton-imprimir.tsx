"use client";

export function BotonImprimir() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 print:hidden"
    >
      Imprimir
    </button>
  );
}
