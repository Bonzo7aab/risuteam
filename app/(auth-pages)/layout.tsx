export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-stone-100 dark:bg-stone-900">
      {children}
    </div>
  );
}
