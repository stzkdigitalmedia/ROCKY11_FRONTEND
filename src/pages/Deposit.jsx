import React from 'react';
import PeerSidebar from '../components/peer/PeerSidebar';
import TransactionsPanel from '../components/peer/TransactionsPanel';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';

const Deposit = () => {
  const { user } = useAuth(true);
  useSocket(user?.clientName);
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <PeerSidebar />
      <div className="flex-1 p-8 ml-64">
        <TransactionsPanel transactionType="Deposit" />
      </div>
    </div>
  );
};

export default Deposit;
