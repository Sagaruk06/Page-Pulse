import PropTypes from 'prop-types';
import './Report.css';

/**
 * Loading skeleton shown while the API request is in-flight.
 * Mirrors the layout of <Report> so the UI doesn't jump when data arrives.
 */
export default function ReportSkeleton() {
  return (
    <div className="report-card">
      <div className="skeleton skeleton-line" style={{ width: '60%', marginBottom: 20 }} />
      <div className="skeleton-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="skeleton-item" key={i}>
            <div className="skeleton skeleton-label" />
            <div className="skeleton skeleton-value" />
          </div>
        ))}
      </div>
    </div>
  );
}

ReportSkeleton.propTypes = {
  // Pure presentational component — no props.
};
