import AuthForm from '@/components/auth/auth-form';

export default function JoinPage() {
  return (
    <main className="flex min-h-screen bg-gradient-to-r from-purple-600 to-blue-500 items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6">
          Join the Club
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Sign up or log in to become a member and access exclusive content.
        </p>
        <AuthForm />
      </div>
    </main>
  );
}