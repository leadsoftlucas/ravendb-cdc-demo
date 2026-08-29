// A small "ⓘ" icon that shows an explanatory tooltip on hover/focus — used
// next to toggles and other controls whose native `title` attribute tooltip
// is too easy to miss, to keep the app didactic without cluttering the
// layout with permanent explanatory text.

function InfoHint({ text }) {
  return (
    <span className="info-hint" tabIndex={0}>
      <span className="info-hint-icon" aria-hidden="true">
        ⓘ
      </span>
      <span className="info-hint-tooltip" role="tooltip">
        {text}
      </span>
    </span>
  );
}
