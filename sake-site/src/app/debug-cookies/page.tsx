import { cookies } from "next/headers";

export default async function DebugCookiesPage() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Debug Cookies</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">All Cookies:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(allCookies, null, 2)}
            </pre>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Sake Cookies:</h2>
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 rounded">
                <strong>sake_role:</strong> {cookieStore.get("sake_role")?.value || "NOT SET"}
              </div>
              <div className="p-3 bg-green-50 rounded">
                <strong>sake_user_id:</strong> {cookieStore.get("sake_user_id")?.value || "NOT SET"}
              </div>
              <div className="p-3 bg-yellow-50 rounded">
                <strong>sake_user_email:</strong> {cookieStore.get("sake_user_email")?.value || "NOT SET"}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <a href="/login" className="text-blue-600 hover:underline mr-4">Go to Login</a>
          <a href="/dashboard" className="text-blue-600 hover:underline">Go to Dashboard</a>
        </div>
      </div>
    </div>
  );
}
