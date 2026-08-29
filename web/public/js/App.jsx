function App() {
  return (
    <I18nProvider>
      <div className="app-shell">
        <Header />
        <main className="split-screen">
          <SqlPanel />
          <RavenPanel />
        </main>
        <Footer />
      </div>
    </I18nProvider>
  );
}
