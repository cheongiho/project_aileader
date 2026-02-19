export type MockMode = 'loading' | 'fail' | null;

export function getMockMode(searchParams?: URLSearchParams): MockMode {
  const params = searchParams ?? new URLSearchParams(window.location.search);
  const mock = params.get('mock');
  if (mock === 'loading') return 'loading';
  if (mock === 'fail') return 'fail';
  return null;
}
