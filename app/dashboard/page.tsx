import Link from "next/link";
import { AuthGuard } from "../components/AuthGuard";
import { ProtectedNavbar } from "../components/ProtectedNavbar";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-stone-100">
        <ProtectedNavbar />
        <main className="mx-auto max-w-2xl px-6 py-10">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-zinc-900">Welcome to your dashboard</h1>
            <p className="mt-3 text-zinc-600">
              Choose where you want to continue in your coaching portal.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/programs"
                className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-stone-100"
              >
                Open Programs
              </Link>
              <Link
                href="/exercises"
                className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-stone-100"
              >
                Open Exercises
              </Link>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
