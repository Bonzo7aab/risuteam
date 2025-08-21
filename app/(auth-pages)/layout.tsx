export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
      
      {/* Footer branding */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-xs text-slate-500">
          <span className="font-medium">RISU Team</span>
          <span className="mx-2">•</span>
          <span>Profesjonalne szkolenia sportowe</span>
        </div>
      </div>
    </div>
  );
}
