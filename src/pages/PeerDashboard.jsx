import React, { useEffect } from "react";
import PeerSidebar from "../components/peer/PeerSidebar";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";

const PeerDashboard = () => {
  const { user } = useAuth(true);
  const { on, off } = useSocket(user?.clientName);

  //--------------------------------------------------------------------
  // Socket event listeners and Notifications ---(PeerDashboard)------
  //--------------------------------------------------------------------

  useEffect(() => {
    console.log(
      "🔌🔌🔌 PeerDashboard - Socket initialized for:",
      user?.clientName,
    );

    on("newManualTransaction", (data) => {
      console.log("💰💰💰💰New Manual Transaction:", data);
    });

    return () => {
      off("newManualTransaction");
    };
  }, [user]);

  //----------------------------------------------------------------------//

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <PeerSidebar />

      {/* Main Content */}
      <div className="flex-1 p-8 ml-64">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Peer Transactions
          </h1>
          <p className="text-gray-700">
            Use the sidebar links to open the Deposit or Withdraw pages.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PeerDashboard;
