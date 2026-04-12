import { Layout } from "@/components/layout";
import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";

const Dashboard = lazy(() => import("./pages/dashboard"));
const Sessions = lazy(() => import("./pages/sessions"));
const SessionDetail = lazy(() => import("./pages/session-detail"));
const NewSession = lazy(() => import("./pages/new-session"));
const NotFound = lazy(() => import("./pages/not-found"));

function Router() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
      <Layout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/sessions" component={Sessions} />
          <Route path="/sessions/new" component={NewSession} />
          <Route path="/sessions/:id" component={SessionDetail} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </Suspense>
  );
}

export default Router;
