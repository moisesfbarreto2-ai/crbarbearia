import { AuthProvider } from "./contexts/AuthContext";
import { AppRouterProvider } from "./router";
import { Toaster } from "./components/ui/toaster";
import { AppProvider } from "./contexts/AppContext";

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <main className="bg-background text-foreground min-h-screen">
          <AppRouterProvider />
          <Toaster />
        </main>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
