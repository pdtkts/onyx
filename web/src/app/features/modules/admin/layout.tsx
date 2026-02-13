import Layout from "@/components/admin/Layout";

export default async function FeaturesAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return await Layout({ children });
}
