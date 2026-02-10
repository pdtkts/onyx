import { redirect } from "next/navigation";
import { getAuthTypeMetadataSS, getCurrentUserSS } from "@/lib/userSS";
import { AuthType } from "@/lib/constants";

export default async function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authTypeMetadata, currentUser] = await Promise.all([
    getAuthTypeMetadataSS(),
    getCurrentUserSS(),
  ]);

  const authDisabled = authTypeMetadata?.authType === AuthType.DISABLED;
  if (!authDisabled && !currentUser) {
    redirect("/auth/login");
  }

  return <>{children}</>;
}
