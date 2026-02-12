import { redirect } from "next/navigation";
import { getCurrentUserSS } from "@/lib/userSS";

export default async function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUserSS();

  if (!currentUser) {
    redirect("/auth/login");
  }

  return <>{children}</>;
}
