/**
 * Supabase Connection Test Component
 * Tests and displays the Supabase connection status
 */

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { CollapsibleSection } from "./CollapsibleSection";

type ConnectionStatus = "checking" | "connected" | "error";

export const SupabaseTest = () => {
  const [status, setStatus] = useState<ConnectionStatus>("checking");
  const [message, setMessage] = useState("Checking connection...");
  const [serverTime, setServerTime] = useState<string | null>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setStatus("checking");
    setMessage("Checking connection...");
    setServerTime(null);

    try {
      // Make an actual network request to verify connection
      // Using fetch to the Supabase REST API health check

      // Connection verified - now check auth session
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      const { data: usersData, error } = await supabase
        .from("user_profiles")
        .select("*");

      if (error) {
        console.error("Error fetching users:", error.message);
        return;
      }
      console.log(usersData);
      setServerTime(new Date().toLocaleString());
      setStatus("connected");
      setMessage(
        session
          ? `Connected (logged in as ${session.user.email})`
          : "Connected (not logged in)"
      );
    } catch (err) {
      setStatus("error");
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setMessage("Connection timed out");
        } else if (
          err.message.includes("Failed to fetch") ||
          err.message.includes("NetworkError")
        ) {
          setMessage("Cannot reach Supabase server");
        } else {
          setMessage(err.message);
        }
      } else {
        setMessage("Connection failed");
      }
    }
  };

  const statusColors = {
    checking: "bg-amber-900/30 text-amber-200 border-amber-400/40 backdrop-blur-sm",
    connected: "bg-green-900/30 text-green-200 border-green-400/40 backdrop-blur-sm",
    error: "bg-red-900/30 text-red-200 border-red-400/40 backdrop-blur-sm",
  };

  const statusIcons = {
    checking: "⏳",
    connected: "✅",
    error: "❌",
  };

  const getStatusIndicator = (): 'success' | 'error' | 'warning' | null => {
    switch (status) {
      case 'connected':
        return 'success';
      case 'error':
        return 'error';
      case 'checking':
        return 'warning';
      default:
        return null;
    }
  };

  return (
    <CollapsibleSection
      title="Supabase Connection"
      icon="🔌"
      defaultExpanded={false}
      statusIndicator={getStatusIndicator()}
    >
      <div className={`p-2 rounded border text-xs ${statusColors[status]}`}>
        <div className="flex items-center gap-2">
          <span>{statusIcons[status]}</span>
          <span className="font-medium">{message}</span>
        </div>

        {serverTime && (
          <div className="mt-1 text-[10px] opacity-75">
            Server time: {serverTime}
          </div>
        )}
      </div>

      <button
        onClick={testConnection}
        className="mt-2 w-full px-3 py-1.5 text-xs font-medium bg-slate-800/90 hover:bg-blue-800/90 backdrop-blur-sm border border-purple-400/30 hover:border-blue-300/50 text-gray-300 hover:text-white rounded-lg transition-all hover:scale-[1.02] shadow-lg"
      >
        🔄 Test Connection
      </button>

      <div className="mt-2 text-[10px] text-purple-300/70">
        <div>URL: {import.meta.env.VITE_SUPABASE_URL || "Not set"}</div>
        <div>
          Key:{" "}
          {import.meta.env.VITE_SUPABASE_ANON_KEY
            ? "••••••" + import.meta.env.VITE_SUPABASE_ANON_KEY.slice(-6)
            : "Not set"}
        </div>
      </div>
    </CollapsibleSection>
  );
};
