import { useEffect, useState } from "react";
import { usersApi } from "@/api/users";
import type { UserResponse } from "@/types/auth";
import { Button } from "@/components/ui/Button";

export function AdminDashboard() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const size = 10;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.getUsers({
        skip: (page - 1) * size,
        limit: size,
        search: search || undefined,
        role: roleFilter || undefined,
      });
      setUsers(data.items);
      setTotal(data.pages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]); // Trigger on page or role filter change

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const toggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await usersApi.changeUserStatus(userId, !currentStatus);
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
    } catch (e) {
      alert("Error al cambiar estado");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Panel de Administración
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Gestionar usuarios de la plataforma
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <form onSubmit={handleSearchSubmit} className="mb-6 flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Todos los roles</option>
            <option value="artista">Artista</option>
            <option value="empresa">Empresa</option>
            <option value="admin">Administrador</option>
          </select>
          <Button type="submit" size="sm">Buscar</Button>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Rol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {loading ? (
                <tr><td colSpan={4} className="py-4 text-center">Cargando...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={4} className="py-4 text-center">No hay usuarios</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {u.full_name}
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {u.role}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.is_active ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }`}>
                        {u.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                      <Button
                        variant={u.is_active ? "secondary" : "primary"}
                        size="sm"
                        onClick={() => toggleStatus(u.id, u.is_active)}
                      >
                        {u.is_active ? "Desactivar" : "Activar"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Página {page} de {total || 1}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= total}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
