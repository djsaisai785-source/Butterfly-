import { Route, Switch, Redirect } from "wouter";
import Navbar from "./components/Navbar";
import HomePage from "./pages/index";
import ExplorePage from "./pages/explore";
import PostPage from "./pages/post";
import MessagesPage from "./pages/messages";
import ProfilePage from "./pages/profile";
import ListingPage from "./pages/listing";
import ReservationsPage from "./pages/reservations";
import SignInPage from "./pages/sign-in";
import SignUpPage from "./pages/sign-up";
import FamillePage from "./pages/famille";
import { authClient } from "./lib/auth";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  if (isPending) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#070711" }}>
      <div style={{ color: "#D4AF37", fontSize: 24, fontWeight: 900, letterSpacing: 4 }}>AURA</div>
    </div>
  );
  if (!session) return <Redirect to="/sign-in" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Switch>
      <Route path="/sign-in" component={SignInPage} />
      <Route path="/sign-up" component={SignUpPage} />
      <Route path="/messages">
        <ProtectedRoute><Navbar /><MessagesPage /></ProtectedRoute>
      </Route>
      <Route>
        <Navbar />
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/explore" component={ExplorePage} />
          <Route path="/listing/:id" component={ListingPage} />
          <Route path="/post">
            <ProtectedRoute><PostPage /></ProtectedRoute>
          </Route>
          <Route path="/profile">
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          </Route>
          <Route path="/reservations">
            <ProtectedRoute><ReservationsPage /></ProtectedRoute>
          </Route>
          <Route path="/famille" component={FamillePage} />
        </Switch>
      </Route>
    </Switch>
  );
}
