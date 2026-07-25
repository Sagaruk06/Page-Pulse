import PropTypes from 'prop-types';
import './ErrorCard.css';

/**
 * Displays an error message when analysis fails.
 * Renders a distinct red-tinted card to visually distinguish from
 * normal data output.
 */
export default function ErrorCard({ error }) {
  return (
    <div className="error-card">
      <div className="error-title">Analysis Failed</div>
      <div className="error-detail">{error}</div>
    </div>
  );
}

ErrorCard.propTypes = {
  /** The error message to display. */
  error: PropTypes.string.isRequired,
};
