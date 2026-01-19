import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { StaffTopbar } from "@/components/staff/StaffTopbar";
import { StaffGuard } from "@/components/staff/StaffGuard";

export default function StaffLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StaffGuard>
      <div className="flex min-h-screen bg-background">
        <StaffSidebar />
        <div className="flex-1 flex flex-col">
          <StaffTopbar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </StaffGuard>
  );
}
