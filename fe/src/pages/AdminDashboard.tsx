import { useEffect, useState, useCallback } from "react";
import { usersApi, type AdminStats } from "@/api/users";
import type { UserResponse } from "@/types/auth";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  Shield, Users, Building2, Palette, Activity, Key, Search,
  Download, FileSpreadsheet, RefreshCw, Trash2, CheckCircle2,
  Megaphone, Server, Layers, X
} from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

type AdminTab = "stats" | "usuarios" | "convocatorias" | "auditoria" | "export";

interface AdminConvItem {
  id_conv: number;
  nombre: string;
  glue?: string;
  nivel_experiencia?: string;
  tipo_jornada?: string;
  rango_salarial?: string;
  ubicacion?: string;
  empresa_nombre: string;
  empresa_email: string;
  total_inscritos: number;
  created_at: string;
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("stats");

  // Stats
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const size = 10;

  // User detail & modals
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [changingRole, setChangingRole] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  // Modal Reset Password
  const [resetModalUser, setResetModalUser] = useState<UserResponse | null>(null);
  const [resetNewPass, setResetNewPass] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");

  // Moderación Convocatorias
  const [adminConvs, setAdminConvs] = useState<AdminConvItem[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [convSearch, setConvSearch] = useState("");

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
      setTotalUsersCount(data.total);
      setTotalPages(data.pages);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  const fetchConvocatorias = useCallback(async () => {
    setLoadingConvs(true);
    try {
      const data = await usersApi.getAllConvocatoriasAdmin();
      setAdminConvs(data);
    } catch {
      // silent
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  // Registros de auditoría dinámicos desde el backend
  const [auditLogs, setAuditLogs] = useState<{ event: string; user: string; time: string }[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const fetchAuditLogs = useCallback(async () => {
    setLoadingAudit(true);
    try {
      const data = await usersApi.getAuditLogs();
      setAuditLogs(data);
    } catch {
      // silent
    } finally {
      setLoadingAudit(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { if (activeTab === "usuarios") fetchUsers(); }, [activeTab, fetchUsers]);
  useEffect(() => { if (activeTab === "convocatorias") fetchConvocatorias(); }, [activeTab, fetchConvocatorias]);
  useEffect(() => { if (activeTab === "auditoria") fetchAuditLogs(); }, [activeTab, fetchAuditLogs]);

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

  const handleAdminResetPassword = async () => {
    if (!resetModalUser || !resetNewPass) return;
    if (resetNewPass.length < 6) {
      setResetError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setResetError("");
    setResetLoading(true);
    try {
      await usersApi.resetUserPassword(resetModalUser.id, resetNewPass);
      setActionMsg(`Contraseña de ${resetModalUser.full_name} actualizada correctamente`);
      setTimeout(() => setActionMsg(""), 4000);
      setResetModalUser(null);
      setResetNewPass("");
    } catch (e: any) {
      setResetError(e.message || "Error al cambiar contraseña");
    } finally {
      setResetLoading(false);
    }
  };

  // Modal de Confirmación Elegante
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    variant?: "danger" | "warning" | "info";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const handleDeleteConvAdmin = (convId: number, nombre: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Moderación: Eliminar Convocatoria",
      message: `¿Seguro que deseas eliminar la convocatoria "${nombre}" del sistema? Esta acción es irreversible.`,
      confirmText: "Eliminar definitivamente",
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await usersApi.deleteConvocatoriaAdmin(convId);
          setAdminConvs((prev) => prev.filter((c) => c.id_conv !== convId));
          setActionMsg("Convocatoria eliminada correctamente");
          setTimeout(() => setActionMsg(""), 3000);
          fetchStats();
        } catch (e: any) {
          setActionMsg(e.message || "Error al eliminar convocatoria");
        }
      },
    });
  };

  const handleExportMetrics = () => {
    if(!stats) return;
    const jsonStr = JSON.stringify(stats, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte_metricas_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleExportUsersCSV = () => {
    if (users.length === 0) return;
    const headers = ["ID", "Nombre", "Email", "Rol", "Estado", "Fecha Registro"];
    const rows = users.map(u => [
      u.id,
      `"${u.full_name}"`,
      u.email,
      u.role,
      u.is_active ? "Activo" : "Inactivo",
      u.created_at
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const openDetail = (u: UserResponse) => {
    setSelectedUser(u);
    setNewRole(u.role);
  };

  const filteredAdminConvs = adminConvs.filter(c => 
    !convSearch || 
    c.nombre.toLowerCase().includes(convSearch.toLowerCase()) || 
    c.empresa_nombre.toLowerCase().includes(convSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Panel de Administración General" }]} />

      {/* Hero Header Glassmorphic */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-purple-500/20">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
        
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-xl ring-2 ring-purple-400/30">
              <Shield className="h-8 w-8 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black sm:text-3xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent">
                  Centro de Control & Auditoría
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" /> 🟢 Sistema 100% Operativo
                </span>
              </div>
              <p className="text-sm text-purple-200/80 mt-1">
                Monitoreo en tiempo real de aprendices, empresas, convocatorias y seguridad del ecosistema cultural SENA.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button variant="secondary" size="sm" onClick={fetchStats} className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md">
              <RefreshCw className="mr-1.5 h-4 w-4 inline" /> Actualizar Datos
            </Button>
            <Button size="sm" onClick={handleExportMetrics} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg">
              <Download className="mr-1.5 h-4 w-4 inline" /> Reporte JSON
            </Button>
          </div>
        </div>
      </div>

      {actionMsg && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-scale-in">
          <CheckCircle2 className="h-5 w-5" /> {actionMsg}
        </div>
      )}

      {/* Tab Navigation Menu */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex gap-4 overflow-x-auto pb-1">
          {([
            { key: "stats" as AdminTab, label: "📊 Analíticas & Salud", Icon: Activity },
            { key: "usuarios" as AdminTab, label: "👥 Gestión de Usuarios", Icon: Users },
            { key: "convocatorias" as AdminTab, label: "💼 Moderación de Convocatorias", Icon: Megaphone },
            { key: "auditoria" as AdminTab, label: "🛡️ Registros de Auditoría", Icon: Server },
            { key: "export" as AdminTab, label: "📥 Centro de Reportes", Icon: FileSpreadsheet },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 pb-3 text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.key
                  ? "border-purple-600 text-purple-600 dark:border-teal-400 dark:text-teal-400"
                  : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <tab.Icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── TAB 1: ANALÍTICAS & SALUD DEL SISTEMA ── */}
      {activeTab === "stats" && (
        <div className="space-y-6 animate-fadeIn">
          {loadingStats ? (
            <div className="p-12 text-center text-sm text-gray-500">Cargando métricas del sistema...</div>
          ) : stats ? (
            <>
              {/* Tarjetas KPI Principales */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: "Total Usuarios Registrados", valor: stats.total_users, sub: "Comunidad total", icon: Users, color: "border-purple-500 text-purple-600 dark:text-purple-400" },
                  { label: "Artistas SENA", valor: stats.total_artistas, sub: `${stats.total_users > 0 ? Math.round((stats.total_artistas / stats.total_users) * 100) : 0}% del total`, icon: Palette, color: "border-teal-500 text-teal-600 dark:text-teal-400" },
                  { label: "Empresas & Organizaciones", valor: stats.total_empresas, sub: `${stats.total_users > 0 ? Math.round((stats.total_empresas / stats.total_users) * 100) : 0}% del total`, icon: Building2, color: "border-blue-500 text-blue-600 dark:text-blue-400" },
                  { label: "Usuarios Activos", valor: stats.active_users, sub: "Sin restricciones", icon: CheckCircle2, color: "border-emerald-500 text-emerald-600 dark:text-emerald-400" },
                  { label: "Convocatorias Publicadas", valor: stats.total_convocatorias, sub: "Ofertas laborales", icon: Megaphone, color: "border-indigo-500 text-indigo-600 dark:text-indigo-400" },
                  { label: "Obras en Portafolios", valor: stats.total_portafolios, sub: "Muestras de talento", icon: Layers, color: "border-amber-500 text-amber-600 dark:text-amber-400" },
                ].map((m, i) => (
                  <div key={m.label} className={`animate-scale-in delay-${i} rounded-2xl border border-gray-200 border-l-4 ${m.color.split(' ')[0]} bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-all hover:shadow-md`}>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{m.label}</p>
                      <m.icon className={`h-5 w-5 ${m.color.split(' ').slice(1).join(' ')}`} />
                    </div>
                    <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{m.valor}</p>
                    <p className="mt-1 text-xs font-semibold text-gray-500 dark:text-gray-400">{m.sub}</p>
                  </div>
                ))}
              </div>

              {/* Distribución por Rol (Visual Bar Chart) */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    📊 Distribución de Miembros por Rol
                  </h3>
                  <div className="space-y-4 pt-2">
                    {[
                      { label: "Artistas (Jóvenes)", count: stats.total_artistas, color: "bg-purple-600" },
                      { label: "Empresas & Organizaciones", count: stats.total_empresas, color: "bg-blue-600" },
                      { label: "Administradores", count: stats.total_admins, color: "bg-amber-500" },
                    ].map((item) => {
                      const pct = stats.total_users > 0 ? Math.round((item.count / stats.total_users) * 100) : 0;
                      return (
                        <div key={item.label} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                            <span className="text-gray-900 dark:text-white font-bold">{item.count} ({pct}%)</span>
                          </div>
                          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                            <div className={`h-full rounded-full transition-all duration-1000 ${item.color}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    📈 Ratios de Dinamización y Salud
                  </h3>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="rounded-xl bg-purple-500/5 border border-purple-500/10 p-4 text-center">
                      <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                        {stats.total_convocatorias > 0 ? (stats.total_postulaciones / stats.total_convocatorias).toFixed(1) : "0"}
                      </p>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1">Postulantes / Convocatoria</p>
                      <p className="text-[10px] text-gray-400">Promedio de interés</p>
                    </div>

                    <div className="rounded-xl bg-teal-500/5 border border-teal-500/10 p-4 text-center">
                      <p className="text-2xl font-black text-teal-600 dark:text-teal-400">
                        {stats.total_artistas > 0 ? (stats.total_portafolios / stats.total_artistas).toFixed(1) : "0"}
                      </p>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1">Portafolios / Artista</p>
                      <p className="text-[10px] text-gray-400">Promedio de portafolios</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* ── TAB 2: GESTIÓN DE USUARIOS ── */}
      {activeTab === "usuarios" && (
        <div className="space-y-4 animate-fadeIn">
          {/* Filtros de Búsqueda */}
          <form
            onSubmit={(e) => { e.preventDefault(); setPage(1); fetchUsers(); }}
            className="flex flex-col gap-3 sm:flex-row bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, correo o sector..."
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 dark:text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 dark:text-white"
            >
              <option value="">Todos los roles</option>
              <option value="artista">🎨 Artista</option>
              <option value="empresa">🏢 Empresa</option>
              <option value="admin">🛡️ Administrador</option>
            </select>
            <Button type="submit" size="sm" className="px-6">Buscar</Button>
          </form>

          <p className="text-xs font-semibold text-gray-500">{totalUsersCount} usuarios registrados encontrados</p>

          {/* Tabla de Usuarios */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-xs">
              <thead className="bg-gray-50 dark:bg-gray-950/50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-gray-500">Usuario</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-gray-500">Rol</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-gray-500">Estado</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-gray-500">Registro</th>
                  <th className="px-4 py-3 text-right font-bold uppercase tracking-wider text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan={5} className="py-12 text-center text-gray-500">Cargando usuarios...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-gray-500">No se encontraron usuarios matching</td></tr>
                ) : users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-purple-600/10 font-bold text-purple-600 dark:text-purple-400">
                          {u.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{u.full_name}</p>
                          <p className="text-gray-400 text-[11px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        u.role === "artista" ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" :
                        u.role === "empresa" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                        "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}>
                        {u.role === "artista" ? "🎨 Artista" : u.role === "empresa" ? "🏢 Empresa" : "🛡️ Admin"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        u.is_active ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
                      }`}>
                        {u.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400 text-[11px]">
                      {new Date(u.created_at).toLocaleDateString("es-CO")}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right space-x-1.5">
                      <Button variant="secondary" size="sm" onClick={() => openDetail(u)}>Ver detalle</Button>
                      <button
                        onClick={() => { setResetModalUser(u); setResetNewPass(""); setResetError(""); }}
                        className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 text-[11px] font-bold hover:bg-amber-500/20 transition-colors"
                        title="Cambiar contraseña de usuario para soporte"
                      >
                        <Key className="h-3.5 w-3.5" /> Clave 🔑
                      </button>
                      <Button variant={u.is_active ? "secondary" : "primary"} size="sm" onClick={() => toggleStatus(u.id, u.is_active)}>
                        {u.is_active ? "Desactivar" : "Activar"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</Button>
            <span className="text-xs font-semibold text-gray-500">Página {page} de {totalPages || 1}</span>
            <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Siguiente</Button>
          </div>
        </div>
      )}

      {/* ── TAB 3: MODERACIÓN DE CONVOCATORIAS ── */}
      {activeTab === "convocatorias" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar convocatoria por nombre o empresa..."
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 dark:text-white"
                value={convSearch}
                onChange={(e) => setConvSearch(e.target.value)}
              />
            </div>
            <p className="text-xs font-bold text-gray-500">{filteredAdminConvs.length} convocatorias registradas</p>
          </div>

          {loadingConvs ? (
            <p className="text-center py-12 text-xs text-gray-500">Cargando convocatorias del sistema...</p>
          ) : filteredAdminConvs.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl">
              <p className="text-xs text-gray-500">No se encontraron convocatorias para moderar.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredAdminConvs.map((c) => (
                <div key={c.id_conv} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-3 relative">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">{c.nombre}</h4>
                      <p className="text-xs text-brand-purple dark:text-brand-teal font-semibold">🏢 {c.empresa_nombre} ({c.empresa_email})</p>
                    </div>
                    <button
                      onClick={() => handleDeleteConvAdmin(c.id_conv, c.nombre)}
                      className="rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 p-2 hover:bg-red-500/20 transition-colors"
                      title="Moderar y Eliminar Convocatoria"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {c.glue && <p className="text-xs text-gray-500 dark:text-gray-400 italic line-clamp-2">"{c.glue}"</p>}

                  <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-2">
                    <span>📍 {c.ubicacion || "Bogotá D.C."}</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">👥 {c.total_inscritos} postulados</span>
                    <span>{c.created_at ? new Date(c.created_at).toLocaleDateString("es-CO") : ""}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: REGISTROS DE AUDITORÍA Y SEGURIDAD ── */}
      {activeTab === "auditoria" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                🛡️ Bitácora de Eventos de Seguridad del Sistema
              </h3>
              <p className="text-xs text-gray-500">Trazabilidad de acciones de usuarios y administradores en tiempo real</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={fetchAuditLogs} disabled={loadingAudit}>
                <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loadingAudit ? "animate-spin" : ""}`} /> Actualizar
              </Button>
              <span className="rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 text-xs font-bold">
                Ley 1581 Habeas Data Audit Active
              </span>
            </div>
          </div>

          {loadingAudit ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" />
              <p className="mt-2 text-xs text-gray-500">Cargando eventos de auditoría...</p>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Server className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No se han registrado eventos recientes en la bitácora</p>
            </div>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log, index) => (
                <div key={index} className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-xs border border-gray-100 dark:border-gray-800/80 hover:border-brand-purple/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{log.event}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{log.user}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-500 shrink-0">{log.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 5: CENTRO DE REPORTES Y EXPORTACIÓN ── */}
      {activeTab === "export" && (
        <div className="grid gap-6 md:grid-cols-2 animate-fadeIn">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              📄 Exportación de Usuarios (CSV)
            </h3>
            <p className="text-xs text-gray-500">Descarga la lista estructurada de artistas y empresas registradas.</p>
            <Button onClick={handleExportUsersCSV} className="w-full">
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar Usuarios en CSV
            </Button>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              📊 Métricas Generales (JSON)
            </h3>
            <p className="text-xs text-gray-500">Descarga el reporte de rendimiento global e indicadores KPI en JSON.</p>
            <Button variant="secondary" onClick={handleExportMetrics} className="w-full">
              <Download className="mr-2 h-4 w-4" /> Descargar JSON de Analíticas
            </Button>
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE USUARIO Y CAMBIO DE ROL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-white space-y-5">
            <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600/20 font-bold text-xl text-purple-400 border border-purple-500/30">
                {selectedUser.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedUser.full_name}</h3>
                <p className="text-xs text-slate-400">{selectedUser.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  ID: {selectedUser.id}
                </span>
              </div>
            </div>

            <div className="border-t border-b border-slate-800 py-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Rol Actual:</span>
                <span className="font-bold text-amber-400 uppercase">{selectedUser.role}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Estado:</span>
                <span className={`font-bold ${selectedUser.is_active ? "text-emerald-400" : "text-red-400"}`}>
                  {selectedUser.is_active ? "✅ Activo" : "❌ Inactivo"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Área / Sector:</span>
                <span className="text-slate-200">{selectedUser.artistic_area || selectedUser.sector || "—"}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Fecha Registro:</span>
                <span className="text-slate-200">{new Date(selectedUser.created_at).toLocaleDateString("es-CO")}</span>
              </div>
            </div>

            {/* Cambio de Rol */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Cambiar Rol de Usuario
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="artista">🎨 Artista</option>
                  <option value="empresa">🏢 Empresa</option>
                  <option value="admin">🛡️ Administrador</option>
                </select>
                <Button size="sm" onClick={handleChangeRole} disabled={changingRole || newRole === selectedUser.role}>
                  {changingRole ? "Guardando..." : "Aplicar"}
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                variant={selectedUser.is_active ? "secondary" : "primary"}
                size="sm"
                onClick={() => toggleStatus(selectedUser.id, selectedUser.is_active)}
              >
                {selectedUser.is_active ? "Desactivar Cuenta" : "Activar Cuenta"}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setSelectedUser(null)}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RESET DE CONTRASEÑA POR ADMIN */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-white space-y-5">
            <button onClick={() => setResetModalUser(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold flex items-center gap-2 text-amber-400">
                <Key className="w-5 h-5" /> Reset de Contraseña (Soporte)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Restablecer contraseña para <span className="text-white font-bold">{resetModalUser.full_name}</span> ({resetModalUser.email})
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Nueva Contraseña
              </label>
              <input
                type="text"
                value={resetNewPass}
                onChange={(e) => setResetNewPass(e.target.value)}
                placeholder="Ingresa la nueva clave (ej: 123456)..."
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            {resetError && <p className="text-xs text-red-400 font-medium">{resetError}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setResetModalUser(null)}>Cancelar</Button>
              <Button size="sm" onClick={handleAdminResetPassword} disabled={resetLoading || !resetNewPass}>
                {resetLoading ? "Guardando..." : "Establecer Nueva Clave"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación Elegante */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
      />
    </div>
  );
}
