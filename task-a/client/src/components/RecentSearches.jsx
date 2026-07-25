import PropTypes from 'prop-types';
import './RecentSearches.css';

/**
 * Displays a row of clickable chips for recently analysed URLs.
 * Empty state is handled by returning null, so the section is
 * completely absent until the user has completed at least one analysis.
 */
export default function RecentSearches({ searches, onSelect }) {
  if (!searches.length) return null;

  return (
    <div className="recent-card">
      <h3>Recent Searches</h3>
      <div className="recent-list">
        {searches.map((url, i) => (
          <button className="recent-chip" key={i} onClick={() => onSelect(url)}>
            {url}
          </button>
        ))}
      </div>
    </div>
  );
}

RecentSearches.propTypes = {
  /** Ordered list of recent URLs (newest first). */
  searches: PropTypes.arrayOf(PropTypes.string).isRequired,
  /** Called with a URL string when the user clicks a chip. */
  onSelect: PropTypes.func.isRequired,
};
