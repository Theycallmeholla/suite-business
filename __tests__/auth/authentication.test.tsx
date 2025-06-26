import { render, screen } from '@testing-library/react';

// Mock the modules before importing components
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  signIn: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock('@/lib/toast', () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

// Import components after mocks
import SignInPage from '@/app/(auth)/signin/page';
import SignUpPage from '@/app/(auth)/signup/page';

describe('Authentication', () => {
  describe('Sign In Page', () => {
    it('renders sign in form', () => {
      render(<SignInPage />);
      
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('Sign Up Page', () => {
    it('renders sign up form', () => {
      render(<SignUpPage />);
      
      expect(screen.getByText(/start your free trial/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    });
  });
});