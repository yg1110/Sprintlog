import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout";
import { ArchivePage } from "./features/archive/ArchivePage";
import { AuthPage } from "./features/auth/AuthPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { LogsPage } from "./features/logs/LogsPage";
import { WorkLogModal } from "./features/logs/WorkLogModal";
import type { OKRDraft } from "./features/okrs/OKRModal";
import { OKRsPage } from "./features/okrs/OKRsPage";
import { ProjectsPage } from "./features/projects/ProjectsPage";
import {
  createOKR,
  createProject,
  deleteOKR,
  deleteProject,
  deleteWorkLog,
  getOKRs,
  getProjects,
  getWorkLogs,
  signOut,
  updateOKR,
  updateProject,
  upsertWorkLog,
} from "./lib/api";
import { supabase } from "./lib/supabase";
import type { OKR, Project, WorkLog } from "./types";

const EMPTY_LOG = (dateStr: string): WorkLog => ({
  log_date: dateStr,
  summary: "",
  done_text: "",
  issue_text: "",
  blocked_text: "",
  decision_text: "",
  learned_text: "",
  tomorrow_plan_text: "",
  metric_change_text: "",
  feedback_text: "",
  improvement_text: "",
  todo_items: [],
  kr_ids: [],
  project_ids: [],
  collaborators: [],
});

function AppRouter() {
  const [session, setSession] = useState<Session | null | undefined>(undefined); // undefined = 로딩 중
  const [okrs, setOkrs] = useState<OKR[]>([]);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  // Dashboard 빠른 업무기록 모달
  const [dashModal, setDashModal] = useState({ open: false, date: "" });
  const [dashLog, setDashLog] = useState<WorkLog>(EMPTY_LOG(new Date().toISOString().slice(0, 10)));

  // 세션 감지
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // 로그인 후 데이터 로드
  useEffect(() => {
    if (!session) return;
    setLoading(true);
    Promise.all([getOKRs(), getWorkLogs(), getProjects()])
      .then(([o, l, p]) => {
        setOkrs(o);
        setLogs(l);
        setProjects(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session]);

  const handleLogout = async () => {
    await signOut();
  };

  const handleSaveLog = async (log: WorkLog) => {
    const saved = await upsertWorkLog(log);

    const allLogs = logs.find((l) => l.log_date === saved.log_date)
      ? logs.map((l) => (l.log_date === saved.log_date ? saved : l))
      : [saved, ...logs];

    setLogs(allLogs);

    // 영향받은 OKR의 KR current_value 동기화 (연결된 업무일지 수로 갱신)
    const updatedOKRs: OKR[] = [];
    for (const okr of okrs) {
      const newKeyResults = okr.key_results.map((kr) => ({
        ...kr,
        current_value: allLogs.filter((l) => (l.kr_ids ?? []).includes(kr.id)).length,
      }));
      const changed = newKeyResults.some(
        (kr, i) => kr.current_value !== okr.key_results[i]?.current_value,
      );
      if (changed) {
        const updated = await updateOKR(okr.id, { ...okr, key_results: newKeyResults });
        updatedOKRs.push(updated);
      }
    }
    if (updatedOKRs.length > 0) {
      setOkrs((prev) => prev.map((o) => updatedOKRs.find((u) => u.id === o.id) ?? o));
    }
  };

  const handleSaveOKR = async (okr: OKRDraft) => {
    if (okr.id) {
      const updated = await updateOKR(okr.id, okr as Omit<OKR, "id">);
      setOkrs((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } else {
      const created = await createOKR(okr as Omit<OKR, "id">);
      setOkrs((prev) => [created, ...prev]);
    }
  };

  const handleDeleteOKR = async (id: string) => {
    await deleteOKR(id);
    setOkrs((prev) => prev.filter((o) => o.id !== id));
  };

  const handleSaveProject = async (project: Omit<Project, "id"> & { id?: string }) => {
    if (project.id) {
      const updated = await updateProject(project.id, project as Omit<Project, "id">);
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } else {
      const created = await createProject(project as Omit<Project, "id">);
      setProjects((prev) => [created, ...prev]);
    }
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDeleteLog = async (id: string) => {
    await deleteWorkLog(id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const handleOpenWorkLog = (date: string) => {
    const existing = logs.find((l) => l.log_date === date);
    setDashLog(existing ? { ...existing } : EMPTY_LOG(date));
    setDashModal({ open: true, date });
  };

  // 세션 로딩 중
  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-black" />
      </div>
    );
  }

  // 미로그인
  if (!session) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  // 로그인됨
  return (
    <Layout onLogout={handleLogout}>
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-black" />
        </div>
      ) : (
        <>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={<DashboardPage logs={logs} okrs={okrs} onOpenWorkLog={handleOpenWorkLog} />}
            />
            <Route
              path="/okrs"
              element={
                <OKRsPage
                  okrs={okrs}
                  logs={logs}
                  onSaveOKR={handleSaveOKR}
                  onDeleteOKR={handleDeleteOKR}
                  onOpenWorkLog={handleOpenWorkLog}
                />
              }
            />
            <Route
              path="/projects"
              element={
                <ProjectsPage
                  projects={projects}
                  logs={logs}
                  onSaveProject={handleSaveProject}
                  onDeleteProject={handleDeleteProject}
                  onOpenWorkLog={handleOpenWorkLog}
                />
              }
            />
            <Route
              path="/work-logs"
              element={<LogsPage logs={logs} okrs={okrs} projects={projects} onSaveLog={handleSaveLog} onDeleteLog={handleDeleteLog} />}
            />
            <Route path="/archive" element={<ArchivePage logs={logs} onOpenWorkLog={handleOpenWorkLog} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          <WorkLogModal
            isOpen={dashModal.open}
            onClose={() => setDashModal((v) => ({ ...v, open: false }))}
            onSave={async (log) => {
              await handleSaveLog(log);
              setDashModal((v) => ({ ...v, open: false }));
            }}
            onDelete={handleDeleteLog}
            log={dashLog}
            setLog={setDashLog}
            okrs={okrs}
            projects={projects}
            allCollaborators={[...new Set(logs.flatMap((l) => l.collaborators ?? []))]}
          />
        </>
      )}
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
