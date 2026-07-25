import PropTypes from 'prop-types';
import './Report.css';

/**
 * Field descriptors for the report grid.
 * Each entry defines one row in the two-column metadata grid.
 */
const FIELDS = [
  { label: 'HTTP Status', key: 'httpStatus', badge: true },
  { label: 'Response Time', key: 'responseTime', format: (v) => `${v} ms` },
  { label: 'Page Title', key: 'title', fallback: '—', full: true },
  { label: 'Meta Description', key: 'metaDescription', fallback: '—', full: true },
  { label: 'H1 Tags', key: 'h1Count' },
  { label: 'Images Missing Alt', key: 'imagesWithoutAlt' },
  { label: 'Word Count', key: 'wordCount', format: (v) => v?.toLocaleString() || '0' },
  { label: 'Content Type', key: 'contentType', fallback: '—' },
];

/**
 * Displays the full analysis result as a structured report card.
 *
 * Renders a header with the URL and success/error badge, a two-column
 * grid of metadata fields, and a "Copy JSON" action button.
 */
export default function Report({ data, onCopy }) {
  return (
    <div className="report-card">
      <div className="report-header">
        <div className="report-url">{data.url}</div>
        {data.httpStatus < 400 ? (
          <span className="badge success">✓ Success</span>
        ) : (
          <span className="badge error">✗ {data.httpStatus}</span>
        )}
      </div>

      <div className="report-grid">
        {FIELDS.map((f) => {
          const raw = data[f.key];
          const display = f.badge
            ? raw
            : f.format
              ? f.format(raw)
              : raw ?? f.fallback;

          return (
            <div
              className={`report-item${f.full ? ' full' : ''}`}
              key={f.label}
            >
              <div className="label">{f.label}</div>
              <div className="value">
                {f.badge ? (
                  <span
                    className={`badge ${data.httpStatus < 400 ? 'success' : 'error'}`}
                  >
                    {raw}
                  </span>
                ) : (
                  display
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="report-actions">
        <button onClick={onCopy}>📋 Copy JSON</button>
      </div>
    </div>
  );
}

Report.propTypes = {
  /** The analysis result object from the API. */
  data: PropTypes.shape({
    url: PropTypes.string.isRequired,
    httpStatus: PropTypes.number.isRequired,
    responseTime: PropTypes.number.isRequired,
    contentType: PropTypes.string,
    title: PropTypes.string,
    metaDescription: PropTypes.string,
    ogTitle: PropTypes.string,
    h1Count: PropTypes.number,
    imagesWithoutAlt: PropTypes.number,
    imagesWithoutAltList: PropTypes.array,
    wordCount: PropTypes.number,
  }).isRequired,
  /** Called when the user clicks "Copy JSON". */
  onCopy: PropTypes.func.isRequired,
};
