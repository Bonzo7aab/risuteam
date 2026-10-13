export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[#FDFBF7] dark:bg-background-dark">{children}</div>;
}
