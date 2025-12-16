import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('axios', () => {
  const mockGet = jest.fn((url) => {
    if (url.startsWith('/api/books')) {
      return Promise.resolve({ data: { books: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } } });
    }
    if (url.startsWith('/api/genres')) {
      return Promise.resolve({ data: [] });
    }
    if (url.startsWith('/api/authors')) {
      return Promise.resolve({ data: [] });
    }
    if (url.startsWith('/api/stats')) {
      return Promise.resolve({ data: { totalBooks: 0, totalAuthors: 0, fileTypes: [] } });
    }
    return Promise.resolve({ data: {} });
  });

  return {
    __esModule: true,
    default: { get: mockGet },
    get: mockGet,
  };
});

test('renders navigation links', async () => {
  render(<App />);
  const homeLink = await screen.findByRole('link', { name: /ana sayfa/i });
  const bookLinks = screen.getAllByRole('link', { name: /kitaplar|tüm kitaplar/i });
  expect(homeLink).toBeInTheDocument();
  expect(bookLinks.length).toBeGreaterThan(0);
});
