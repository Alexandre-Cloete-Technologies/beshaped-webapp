import { ProtectedNavbar } from "../../components/ProtectedNavbar";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <div className="min-h-screen bg-stone-100">
      <ProtectedNavbar />
      <main>{children}</main>
    </div>

  );
}
