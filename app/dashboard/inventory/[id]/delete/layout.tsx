export default function DeleteInventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container max-w-screen-lg mx-auto py-6">
      {children}
    </div>
  );
}
