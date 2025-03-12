import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Building2, Key, Save, TestTube, AlertTriangle, User, Eye, EyeOff, LogOut } from 'lucide-react';
import { MondeAPI, useMondeStore } from '../../lib/monde-api';

export function MondeIntegration() {
  const { baseUrl: savedBaseUrl, token: savedToken, setConfig, clearConfig } = useMondeStore();
  const [baseUrl, setBaseUrl] = useState(savedBaseUrl);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (savedToken) {
      testConnection();
    }
  }, []);

  const testConnection = async () => {
    setLoading(true);
    setTestResult(null);
    setError(null);

    try {
      const api = new MondeAPI(baseUrl, savedToken);
      const isConnected = await api.testConnection();

      setTestResult({
        success: isConnected,
        message: isConnected
          ? 'Conexão estabelecida com sucesso!'
          : 'Falha ao conectar com a API',
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Falha ao testar conexão',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setTestResult(null);

    try {
      const api = new MondeAPI(baseUrl);
      const token = await api.authenticate(login, password);

      setConfig({ baseUrl, token });
      setSuccess(true);
      setTestResult({
        success: true,
        message: 'Conexão estabelecida com sucesso!',
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar configurações');
      setTestResult({
        success: false,
        message: err.message || 'Falha ao testar conexão',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    clearConfig();
    setTestResult(null);
    setBaseUrl('');
    setLogin('');
    setPassword('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-indigo-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Integração Monde
          </h2>
        </div>
        {savedToken && (
          <button
            onClick={handleDisconnect}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 dark:border-red-900 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900/75"
          >
            <LogOut className="h-4 w-4" />
            Desconectar
          </button>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {savedToken ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-medium">API Configurada</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {baseUrl}
                </p>
              </div>
            </div>

            {testResult && (
              <div
                className={cn(
                  'flex items-center gap-3 rounded-md p-4 text-sm',
                  testResult.success
                    ? 'bg-green-50 text-green-600 dark:bg-green-900/50 dark:text-green-400'
                    : 'bg-red-50 text-red-600 dark:bg-red-900/50 dark:text-red-400'
                )}
              >
                {testResult.success ? (
                  <Building2 className="h-5 w-5 shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                )}
                <p>{testResult.message}</p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={testConnection}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <TestTube className="h-4 w-4" />
                Testar Conexão
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/50 dark:text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 p-4 text-sm text-green-500 dark:bg-green-900/50 dark:text-green-400">
                Configurações salvas com sucesso!
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="base-url"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Domínio Monde
                </label>
                <input
                  type="text"
                  id="base-url"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder="suaagencia.monde.com.br"
                  required
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Digite apenas o domínio do seu Monde, sem http:// ou https://
                </p>
              </div>

              <div>
                <label
                  htmlFor="login"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Login ou Email
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    id="login"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="block w-full flex-1 rounded-none rounded-r-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                    placeholder="admin ou admin@suaagencia.monde.com.br"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Senha
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    <Key className="h-4 w-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full flex-1 rounded-none border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                    placeholder="Sua senha do Monde"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {testResult && (
              <div
                className={cn(
                  'mt-4 rounded-md p-4 text-sm',
                  testResult.success
                    ? 'bg-green-50 text-green-500 dark:bg-green-900/50 dark:text-green-400'
                    : 'bg-red-50 text-red-500 dark:bg-red-900/50 dark:text-red-400'
                )}
              >
                {testResult.message}
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}