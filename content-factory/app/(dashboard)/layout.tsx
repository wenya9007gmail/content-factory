import "@/app/globals.css";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050513] text-zinc-100">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="p-10 space-y-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
