"use client";

import { ReactNode, useState, useEffect } from 'react';
import HistorySidebar from "./components/history-sidebar";
import { createClient } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';

// Define a type for the session data to ensure type safety.
type Session = {
  id: string;
  name: string;
  step: number;
  updated_at: string;
  neo_report_name: string | null;
};

// Initialize the Supabase client.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AppWrapper({ children }: { children: ReactNode }) {
  const [showHistory, setShowHistory] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const router = useRouter();
  const pathname = usePathname(); // Nieuwe hook om het pad te krijgen

  // Bepaal of we op de loginpagina zijn
  const isLoginPage = pathname === "/login";

  // Functie om de sessies op te halen
  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('sessions')
      .select('id, name, step, updated_at, neo_report_name')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error("Error fetching sessions:", error);
    } else {
      setSessions(data as Session[]);
    }
  };

  // Functie voor het aanmaken van een nieuwe sessie
  const handleCreateNewSession = async (name: string) => {
    const { data, error } = await supabase
      .from('sessions')
      .insert([
        {
          name: name,
          step: 0,
          neo_report_name: null,
          updated_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error("Error creating new session:", error);
      throw new Error("Failed to create new session.");
    }

    // Navigeer naar de nieuwe sessiepagina
    if (data && data.length > 0) {
      const newSessionId = data[0].id;
      router.push(`/session/${newSessionId}/personality`);
      fetchSessions();
    }
  };

  // Functie voor het verwijderen van een sessie
  const handleDeleteSession = async (sessionId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error("Error deleting session:", error);
      return false;
    }
    
    fetchSessions();
    return true;
  };

  // Functie voor het updaten van de naam van een sessie
  const handleUpdateSession = async (sessionId: string, data: { name: string }) => {
    const { error } = await supabase
      .from('sessions')
      .update({ name: data.name })
      .eq('id', sessionId);

    if (error) {
      console.error("Error updating session:", error);
      throw new Error("Failed to update session.");
    }
  
    fetchSessions();
  };

  // Functie voor het inladen van een sessie
  const handleLoadSession = (session: Session) => {
    router.push(`/session/${session.id}/personality`);
  };

  useEffect(() => {
    // Alleen sessies ophalen als we niet op de loginpagina zijn
    if (!isLoginPage) {
      fetchSessions();
    }
  }, [isLoginPage]);

  return (
    <>
      {/* Conditie: render de sidebar alleen als het GEEN loginpagina is */}
      {!isLoginPage ? (
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <HistorySidebar
            showHistory={showHistory}
            setShowHistory={setShowHistory}
            sessions={sessions}
            onLoadSession={handleLoadSession}
            onDeleteSession={handleDeleteSession}
            onUpdateSession={handleUpdateSession}
            onNewSession={handleCreateNewSession}
            currentPage="tool"
            onNavigate={(p) => router.push(`/${p}`)}
          />

          <main style={{ flex: 1, padding: "24px" }}>{children}</main>
        </div>
      ) : (
        // Render alleen de children (de loginpagina) als het wel de loginpagina is
        <main>{children}</main>
      )}
    </>
  );
}
