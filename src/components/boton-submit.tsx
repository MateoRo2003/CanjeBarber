"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

/**
 * Botón de submit que se auto-deshabilita y muestra un spinner mientras
 * el form action está en curso (usa useFormStatus, así que SIEMPRE tiene
 * que estar dentro de un <form>). Reemplaza a un <button type="submit">
 * suelto en cualquier form que dispare una server action.
 */
export function BotonSubmit({
  children,
  pendingText,
  className = "",
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending && pendingText ? pendingText : children}
    </button>
  );
}
