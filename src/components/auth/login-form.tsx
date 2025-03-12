import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth-store';
import { LogIn, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin123';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { signIn, signUp } = useAuthStore();

  useEffect(() => {
    const createAdminAccount = async () => {
      try {
        // Tenta fazer login como admin para verificar se a conta existe
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        });

        // Se der erro de credenciais inválidas, significa que a conta não existe
        if (signInError?.message === 'Invalid login credentials') {
          // Cria a conta de admin
          const { error: signUpError } = await supabase.auth.signUp({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
          });

          if (signUpError) {
            console.error('Erro ao criar conta admin:', signUpError);
          } else {
            console.log('Conta admin criada com sucesso');
          }
        }
      } catch (err) {
        console.error('Erro ao verificar/criar conta admin:', err);
      }
    };

    createAdminAccount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegistering) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(isRegistering ? 'Erro ao criar conta' : 'Credenciais inválidas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {isRegistering ? 'Criar nova conta' : 'Entrar na plataforma'}
          </h2>
          {!isRegistering && (
            <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
              Use admin@admin.com / admin123 para acessar
            </p>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 text-red-500 dark:text-red-400 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 dark:focus:ring-blue-500 focus:border-indigo-500 dark:focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 dark:focus:ring-blue-500 focus:border-indigo-500 dark:focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                placeholder="Senha"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-blue-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {isRegistering ? (
                  <UserPlus className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400 dark:text-blue-400 dark:group-hover:text-blue-300" />
                ) : (
                  <LogIn className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400 dark:text-blue-400 dark:group-hover:text-blue-300" />
                )}
              </span>
              {isRegistering ? 'Criar conta' : 'Entrar'}
            </button>

            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {isRegistering
                ? 'Já tem uma conta? Entre aqui'
                : 'Não tem uma conta? Registre-se'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}