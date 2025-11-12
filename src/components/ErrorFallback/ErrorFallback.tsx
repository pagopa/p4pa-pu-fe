import { CSSProperties } from 'react';
import utils from '../../utils';

export const ErrorFallback = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Spiacenti, qualcosa è andato storto.</h1>
      <h2 style={styles.subtitle}>
        Si è verificato un errore. Riprova più tardi.
      </h2>
      <button
        onClick={() => window.location.replace(utils.config.loginUrl)}
        style={styles.link}
      >
        Ritorna alla login
      </button>
    </div>
  );
};

const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    flexDirection: 'column',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    padding: '2rem',
    textAlign: 'center',
    backgroundColor: '#fafafa'
  },
  title: {
    fontSize: '3rem',
    fontWeight: 300,
    color: '#212121',
    marginBottom: '0.35em',
    marginTop: 0
  },
  subtitle: {
    fontSize: '1.25rem',
    fontWeight: 400,
    color: '#757575',
    marginBottom: '1.5rem',
    marginTop: 0
  },
  link: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#1976d2',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.02857em',
    transition: 'background-color 0.3s ease',
    marginTop: '1rem',
    border: 'none',
    cursor: 'pointer'
  }
};
