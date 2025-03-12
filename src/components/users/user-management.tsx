import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth-store';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  role: string;
}

interface FormData {
  email: string;
  full_name: string;
  phone: string;
  password: string;
  newPassword: string;
  avatar_url: string;
}

const initialFormData: FormData = {
  email: '',
  full_name: '',
  phone: '',
  password: '',
  newPassword: '',
  avatar_url: '',
};

const translateError = (error: any): string => {
  const errorMessages: Record<string, string> = {
    'User not found': 'Usuário não encontrado',
    'Email already taken': 'Este email já está em uso',
    'Password is too short': 'A senha é muito curta',
    'Invalid login credentials': 'Credenciais inválidas',
    'Could not find the phone column of profiles in the schema cache': 'Erro ao acessar o campo de telefone. Por favor, atualize a página.',
    'Bucket not found': 'Erro ao fazer upload da imagem. Por favor, tente novamente.',
  };

  if (error?.message) {
    return errorMessages[error.message] || 'Ocorreu um erro inesperado';
  }

  return 'Ocorreu um erro inesperado';
};

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const { user: currentUser, updateProfile } = useAuthStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setFormData({
        email: selectedUser.email || '',
        full_name: selectedUser.full_name || '',
        phone: selectedUser.phone || '',
        password: '',
        newPassword: '',
        avatar_url: selectedUser.avatar_url || '',
      });
    } else {
      setFormData(initialFormData);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      setUsers(profiles || []);
    } catch (err: any) {
      console.error('Erro ao carregar usuários:', err);
      setError(translateError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    setFormData(prev => ({
      ...prev,
      avatar_url: URL.createObjectURL(file),
    }));
  };

  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) return null;

    try {
      setUploadingAvatar(true);
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Remover avatar anterior se existir
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(userId);

      if (existingFiles?.length) {
        await Promise.all(
          existingFiles.map(file =>
            supabase.storage
              .from('avatars')
              .remove([`${userId}/${file.name}`])
          )
        );
      }

      // Upload do novo avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      throw error;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (selectedUser) {
        let avatarUrl = formData.avatar_url;
        if (avatarFile) {
          avatarUrl = await uploadAvatar(selectedUser.id) || avatarUrl;
        }

        // Atualizar email no Auth
        if (formData.email !== selectedUser.email) {
          const { error: updateAuthError } = await supabase.auth.updateUser({
            email: formData.email,
          });

          if (updateAuthError) throw updateAuthError;
        }

        // Atualizar perfil
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            email: formData.email,
            full_name: formData.full_name,
            phone: formData.phone,
            avatar_url: avatarUrl,
          })
          .eq('id', selectedUser.id);

        if (updateError) throw updateError;

        if (formData.newPassword) {
          const { error: passwordError } = await supabase.auth.updateUser({
            password: formData.newPassword,
          });

          if (passwordError) throw passwordError;
        }

        // Se o usuário atual foi atualizado, atualizar o estado de autenticação
        if (selectedUser.id === currentUser?.id) {
          await updateProfile({
            full_name: formData.full_name,
            avatar_url: avatarUrl,
            phone: formData.phone,
          });
        }
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          let avatarUrl = null;
          if (avatarFile) {
            avatarUrl = await uploadAvatar(data.user.id);
          }

          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: formData.email,
              full_name: formData.full_name,
              phone: formData.phone,
              avatar_url: avatarUrl,
              role: 'user',
            });

          if (profileError) throw profileError;
        }
      }

      setDialogOpen(false);
      setAvatarFile(null);
      fetchUsers();
    } catch (err: any) {
      console.error('Erro ao salvar usuário:', err);
      setError(translateError(err));
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      // Remover avatar
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(selectedUser.id);

      if (existingFiles?.length) {
        await Promise.all(
          existingFiles.map(file =>
            supabase.storage
              .from('avatars')
              .remove([`${selectedUser.id}/${file.name}`])
          )
        );
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);

      if (profileError) throw profileError;

      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      console.error('Erro ao excluir usuário:', err);
      setError(translateError(err));
    }
  };

  const handleOpenDialog = (user: User | null) => {
    setSelectedUser(user);
    setDialogOpen(true);
    setAvatarFile(null);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gerenciar Usuários
        </h2>
        <button
          onClick={() => handleOpenDialog(null)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Novo Usuário
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/50 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Usuário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Telefone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Tipo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=random`}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {user.full_name}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-gray-500 dark:text-gray-400">
                  {user.email}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-gray-500 dark:text-gray-400">
                  {user.phone}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                  }`}>
                    {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenDialog(user)}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setDeleteDialogOpen(true);
                      }}
                      className="rounded p-1 text-red-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit User Dialog */}
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
              </Dialog.Title>
              <Dialog.Close className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={formData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.full_name || 'User')}&background=random`}
                    alt=""
                    className="h-24 w-24 rounded-full object-cover"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 rounded-full bg-indigo-600 p-2 text-white hover:bg-indigo-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    <Upload className="h-4 w-4" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              {!selectedUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Senha
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    required={!selectedUser}
                  />
                </div>
              )}

              {selectedUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    placeholder="Deixe em branco para não alterar"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploadingAvatar}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploadingAvatar ? 'Salvando...' : selectedUser ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <AlertDialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
              Excluir usuário
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Tem certeza que deseja excluir o usuário {selectedUser?.full_name}? Esta ação não
              pode ser desfeita.
            </AlertDialog.Description>

            <div className="mt-6 flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <button className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                  Cancelar
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={handleDelete}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Excluir
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}