import { useEffect, useState, useCallback } from "react";
import { usersApi, type AdminStats } from "@/api/users";
import type { UserResponse } from "@/types/auth";
import { Button } from "@/components/ui/Button";

type AdminTab = "stats" | "usuarios" | "detalle";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("stats");

  // Stats
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const size = 10;

  // User detail / role change
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [changingRole, setChangingRole] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await usersApi.getAdminStats();
      setStats(data);
    } catch {
      // silent
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usersApi.getUsers({
        skip: (page - 1) * size,
        limit: size,
        search: search || undefined,
        role: roleFilter || undefined,
      });
      setUsers(data.items);
      setTotal(data.total);
      setTotalPages(data.pages);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { if (activeTab === "usuarios") fetchUsers(); }, [activeTab, fetchUsers]);

  const toggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await usersApi.changeUserStatus(userId, !currentStatus);
      setUsers(users.map((u) => u.id === userId ? { ...u, is_active: !currentStatus } : u));
      if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, is_active: !currentStatus });
      setActionMsg(!currentStatus ? "Usuario activado" : "Usuario desactivado");
      setTimeout(() => setActionMsg(""), 3000);
      fetchStats();
    } catch {
      alert("Error al cambiar estado");
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) return;
    setChangingRole(true);
    try {
      await usersApi.changeUserRole(selectedUser.id, newRole);
      const updated = { ...selectedUser, role: newRole };
      setSelectedUser(updated);
      setUsers(users.map((u) => u.id === selectedUser.id ? updated : u));
      setActionMsg(`Rol cambiado a ${newRole}`);
      setTimeout(() => setActionMsg(""), 3000);
      fetchStats();
    } catch (e: any) {
      setActionMsg(e.message || "Error al cambiar rol");
    } finally {
      setChangingRole(false);
    }
  };

  const openDetail = (u: UserResponse) => {
    setSelectedUser(u);
    setNewRole(u.role);
    setActiveTab("detalle");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-dark via-gray-800 to-brand-dark p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <h1 className="text-2xl font-bold">🛡️ Panel de Administración</h1>
          <p className="mt-1 text-sm text-white/70">Gestiona usuarios, roles y supervisa la plataforma</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-6">
          {([
            { key: "stats" as AdminTab, label: "📊 Estadísticas" },
            { key: "usuarios" as AdminTab, label: "👥 Usuarios" },
            ...(selectedUser ? [{ key: "detalle" as AdminTab, label: `👤 ${selectedUser.full_name.split(" ")[0]}` }] : []),
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-brand-purple text-brand-purple dark:border-brand-teal dark:text-brand-teal"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── TAB: ESTADÍSTICAS ── */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          {loadingStats ? (
            <p className="text-sm text-gray-500">Cargando estadísticas...</p>
          ) : stats ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: "Total usuarios", valor: stats.total_users, icon: "👥", color: "border-l-brand-purple" },
                  { label: "Artistas", valor: stats.total_artistas, icon: "🎨", color: "border-l-brand-teal" },
                  { label: "Empresas", valor: stats.total_empresas, icon: "🏢", color: "border-l-brand-blue" },
                  { label: "Administradores", valor: stats.total_admins, icon: "🛡️", color: "border-l-brand-orange" },
                  { label: "Usuarios activos", valor: stats.active_users, icon: "✅", color: "border-l-green-500" },
                  { label: "Usuarios inactivos", valor: stats.inactive_users, icon: "❌", color: "border-l-red-400" },
                  { label: "Convocatorias", valor: stats.total_convocatorias, icon: "💼", color: "border-l-brand-purple" },
                  { label: "Postulaciones", valor: stats.total_postulaciones, icon: "📤", color: "border-l-brand-teal" },
                  { label: "Portafolios", valor: stats.total_portafolios, icon: "🖼️", color: "border-l-brand-orange" },
                ].map((m) => (
                  <div key={m.label} className={`rounded-xl border border-gray-200 border-l-4 ${m.color} bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900`}>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{m.label}</p>
                    <p className="mt-1 flex items-baseline gap-2 text-3xl font-bold text-gray-900 dark:text-white">
                      {m.icon} {m.valor}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Distribución de usuarios</h2>
                <div className="space-y-3">
                  {[
                    { label: "Artistas", count: stats.total_artistas, total: stats.total_users, color: "bg-brand-purple" },
                    { label: "Empresas", count: stats.total_empresas, total: stats.total_users, color: "bg-brand-blue" },
                    { label: "Admins", count: stats.total_admins, total: stats.total_users, color: "bg-brand-orange" },
                  ].map((item) => {
                    const pct = stats.total_users > 0 ? Math.round((item.count / stats.total_users) * 100) : 0;
                    return (
                      <div key={item.label}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{item.count} ({pct}%)</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Actividad de la plataforma</h2>
                <div className="grid gap-6 sm:grid-cols-3">
                  {[
                    { label: "Ratio de actividad", valor: stats.total_users > 0 ? `${Math.round((stats.active_users / stats.total_users) * 100)}%` : "0%", desc: "Usuarios activos" },
                    { label: "Postulaciones/Conv.", valor: stats.total_convocatorias > 0 ? (stats.total_postulaciones / stats.total_convocatorias).toFixed(1) : "0", desc: "Promedio" },
                    { label: "Port./Artista", valor: stats.total_artistas > 0 ? (stats.total_portafolios / stats.total_artistas).toFixed(1) : "0", desc: "Promedio" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-800">
                      <p className="text-3xl font-bold text-brand-purple dark:text-brand-teal">{item.valor}</p>
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-red-500">No se pudieron cargar las estadísticas</p>
          )}
        </div>
      )}

      {/* ── TAB: USUARIOS ── */}
      {activeTab === "usuarios" && (
        <div className="space-y-4">
          <form
            onSubmit={(e) => { e.preventDefault(); setPage(1); fetchUsers(); }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              placeholder="Buscar por nombre, correo o sector..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Todos los roles</option>
              <option value="artista">Artista</option>
              <option value="empresa">Empresa</option>
              <option value="admin">Administrador</option>
            </select>
            <Button type="submit" size="sm">Buscar</Button>
          </form>

          <p className="text-sm text-gray-500 dark:text-gray-400">{total} usuarios encontrados</p>

          {actionMsg && (
            <div className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
              ✅ {actionMsg}
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Usuario</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Rol</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Registrado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {loading ? (
                  <tr><td colSpan={5} className="py-8 text-center text-sm text-gray-500">Cargando...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-sm text-gray-500">No se encontraron usuarios</td></tr>
                ) : users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple/20 to-brand-teal/20 text-xs font-bold text-brand-purple dark:text-brand-teal">
                          {u.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{u.full_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.role === "artista" ? "bg-brand-purple/10 text-brand-purple dark:text-purple-300" :
                        u.role === "empresa" ? "bg-brand-blue/10 text-brand-blue dark:text-blue-300" :
                        "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                      }`}>
                        {u.role === "artista" ? "🎨 Artista" : u.role === "empresa" ? "🏢 Empresa" : "🛡️ Admin"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.is_active ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }`}>
                        {u.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(u.created_at).toLocaleDateString("es-CO")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right space-x-2">
                      <Button variant="secondary" size="sm" onClick={() => openDetail(u)}>Ver detalle</Button>
                      <Button variant={u.is_active ? "secondary" : "primary"} size="sm" onClick={() => toggleStatus(u.id, u.is_active)}>
                        {u.is_active ? "Desactivar" : "Activar"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">Página {page} de {totalPages || 1}</span>
            <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Siguiente</Button>
          </div>
        </div>
      )}

      {/* ── TAB: DETALLE USUARIO ── */}
      {activeTab === "detalle" && selectedUser && (
        <div className="space-y-6">
          <button onClick={() => setActiveTab("usuarios")} className="text-sm font-medium text-brand-purple hover:underline dark:text-brand-teal">
            ← Volver a usuarios
          </button>

          {actionMsg && (
            <div className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
              ✅ {actionMsg}
            </div>
          )}

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple/30 to-brand-teal/30 text-2xl font-bold text-brand-purple dark:text-brand-teal">
                {selectedUser.full_name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedUser.full_name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
              </div>
            </div>

            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "ID", valor: selectedUser.id.slice(0, 8) + "..." },
                { label: "Rol actual", valor: selectedUser.role },
                { label: "Estado", valor: selectedUser.is_active ? "✅ Activo" : "❌ Inactivo" },
                { label: "Área artística", valor: selectedUser.artistic_area || "—" },
                { label: "Sector", valor: selectedUser.sector || "—" },
                { label: "Ubicación", valor: selectedUser.location || "—" },
                { label: "Registrado", valor: new Date(selectedUser.created_at).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" }) },
                { label: "Última actualización", valor: new Date(selectedUser.updated_at).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" }) },
                ...(selectedUser.birth_date ? [{ label: "Fecha de nacimiento", valor: new Date(selectedUser.birth_date).toLocaleDateString("es-CO") }] : []),
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{item.label}</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 break-all">{item.valor}</dd>
                </div>
              ))}
            </dl>

            {selectedUser.bio && (
              <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Bio</dt>
                <dd className="mt-1 text-sm text-gray-700 dark:text-gray-300">{selectedUser.bio}</dd>
              </div>
            )}
          </div>

          {/* Cambiar rol */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Cambiar rol</h3>
            <div className="flex items-center gap-3">
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="artista">🎨 Artista</option>
                <option value="empresa">🏢 Empresa</option>
                <option value="admin">🛡️ Administrador</option>
              </select>
              <Button
                size="sm"
                onClick={handleChangeRole}
                disabled={changingRole || newRole === selectedUser.role}
              >
                {changingRole ? "Cambiando..." : "Aplicar cambio"}
              </Button>
            </div>
            {newRole !== selectedUser.role && (
              <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                ⚠️ Cambiarás el rol de "{selectedUser.role}" a "{newRole}". Esta acción afecta los permisos del usuario.
              </p>
            )}
          </div>

          {/* Activar / Desactivar */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">Estado de la cuenta</h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              {selectedUser.is_active ? "Esta cuenta está activa. El usuario puede iniciar sesión y usar la plataforma." : "Esta cuenta está desactivada. El usuario no puede iniciar sesión."}
            </p>
            <Button
              variant={selectedUser.is_active ? "secondary" : "primary"}
              onClick={() => toggleStatus(selectedUser.id, selectedUser.is_active)}
            >
              {selectedUser.is_active ? "Desactivar cuenta" : "Activar cuenta"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
