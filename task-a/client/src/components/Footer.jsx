import './Footer.css';

/**
 * Application footer.
 * Displays the required "Built for Digital Heroes Training Task" credit.
 */
export default function Footer() {
  return (
    <footer className="app-footer">
      Built for{' '}
      <a
        href="https://digitalheroesco.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        Digital Heroes Training Task
      </a>
    </footer>
  );
}
