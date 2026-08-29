function LanguageToggle() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="language-toggle">
      <button
        type="button"
        className={`language-toggle-flag ${locale === "en" ? "language-toggle-flag-active" : ""}`}
        onClick={() => setLocale("en")}
        title="English"
        aria-pressed={locale === "en"}
      >
        <img src="/img/US.png" alt="English" />
      </button>
      <button
        type="button"
        className={`language-toggle-flag ${locale === "pt" ? "language-toggle-flag-active" : ""}`}
        onClick={() => setLocale("pt")}
        title="Português (Brasil)"
        aria-pressed={locale === "pt"}
      >
        <img src="/img/BR.png" alt="Português (Brasil)" />
      </button>
    </div>
  );
}
