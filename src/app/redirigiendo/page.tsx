import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Página puente: decide a dónde va cada usuario apenas se loguea,
// según sea el admin (email == ADMIN_EMAIL) o un cliente cualquiera.
export default async function RedirigiendoPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  redirect(session.user.isAdmin ? "/admin" : "/perfil");
}
