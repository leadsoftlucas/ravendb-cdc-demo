function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="split-screen">
        <SqlPanel />
        <RavenPanel />
      </main>
      <Footer />
    </div>
  );
}
