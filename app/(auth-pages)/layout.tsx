export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
