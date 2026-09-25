import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/api/client";

interface Patient {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  _count: { sessions: number };
}

interface PatientSession {
  id: string;
  startedAt: string;
  topPrediction?: string;
  summary?: string;
  screeningJson?: any;
}

export function DoctorDashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [sessions, setSessions] = useState<PatientSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get("/doctor/patients");
      setPatients(res.data);
    } catch (error) {
      console.error("Failed to fetch patients", error);
    } finally {
      setLoading(false);
    }
  };

  const viewSessions = async (patientId: string) => {
    setSelectedPatient(patientId);
    try {
      const res = await api.get(`/doctor/patients/${patientId}/sessions`);
      setSessions(res.data);
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Doctor Portal</h1>
        <p className="mt-2 text-muted-foreground">Manage your patients and review their clinical assessment results.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patients</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : patients.length === 0 ? (
              <p className="text-muted-foreground">No patients found on the platform.</p>
            ) : (
              <div className="space-y-3">
                {patients.map((patient) => (
                  <div key={patient.id} className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${selectedPatient === patient.id ? 'bg-muted/50 border-primary' : 'bg-card'}`} onClick={() => viewSessions(patient.id)}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-foreground">{patient.name || 'Anonymous User'}</p>
                        <p className="text-xs text-muted-foreground">{patient.email}</p>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-full">
                        {patient._count.sessions} Sessions
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient History</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedPatient ? (
              <p className="text-muted-foreground text-center py-8">Select a patient to view their assessment history.</p>
            ) : sessions.length === 0 ? (
              <p className="text-muted-foreground">No sessions recorded for this patient.</p>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {sessions.map(session => (
                  <div key={session.id} className="p-4 border rounded-lg bg-card space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{new Date(session.startedAt).toLocaleString()}</span>
                      {session.topPrediction && (
                        <span className="text-primary font-medium">{session.topPrediction.replace(/([A-Z])/g, " $1").trim()}</span>
                      )}
                    </div>
                    {session.summary && (
                      <p className="text-sm text-muted-foreground mt-2">{session.summary}</p>
                    )}
                    {session.screeningJson?.screeningIndex && (
                      <div className="mt-2 pt-2 border-t flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Clinical Score</span>
                        <span className="font-bold">{session.screeningJson.screeningIndex.score} / 100</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
