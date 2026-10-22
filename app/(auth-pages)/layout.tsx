export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="relative min-h-0 bg-transparent">{children}</div>;
}
