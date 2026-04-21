"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

type Proposal = {
  id: bigint;
  name: string;
  voteCount: bigint;
  exists: boolean;
};

export default function Home() {
  const { address: connectedAddress } = useAccount();

  const [proposalName, setProposalName] = useState("");
  const [proposalIds, setProposalIds] = useState<number[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [message, setMessage] = useState("");

  const { data: proposalCount, refetch: refetchProposalCount } = useScaffoldReadContract({
    contractName: "VotingDapp",
    functionName: "proposalCount",
  });

  const { data: ownerAddress } = useScaffoldReadContract({
    contractName: "VotingDapp",
    functionName: "owner",
  });

  const { writeContractAsync: writeVotingDappAsync } = useScaffoldWriteContract({
    contractName: "VotingDapp",
  });

  useEffect(() => {
    const count = Number(proposalCount || 0n);
    const ids = [];
    for (let i = 1; i <= count; i++) {
      ids.push(i);
    }
    setProposalIds(ids);
  }, [proposalCount, refreshKey]);

  const handleCreateProposal = async () => {
    if (!proposalName.trim()) {
      setMessage("Proposal name cannot be empty.");
      return;
    }

    try {
      setMessage("Creating proposal...");
      await writeVotingDappAsync({
        functionName: "createProposal",
        args: [proposalName],
      });

      setProposalName("");
      await refetchProposalCount();
      setRefreshKey(prev => prev + 1);
      setMessage("Proposal created successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to create proposal.");
    }
  };

  const handleVote = async (proposalId: number) => {
    try {
      setMessage(`Voting for proposal ${proposalId}...`);
      await writeVotingDappAsync({
        functionName: "vote",
        args: [BigInt(proposalId)],
      });

      setRefreshKey(prev => prev + 1);
      setMessage("Vote submitted successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Vote failed. You may have already voted.");
    }
  };

  return (
    <main className="min-h-screen bg-base-200 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center">Voting DApp</h1>
        <p className="text-center mb-8">Built with Scaffold-ETH 2</p>

        <div className="bg-base-100 rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Connected Wallet</h2>
          <p className="break-all">{connectedAddress ? connectedAddress : "No wallet connected"}</p>
        </div>

        {connectedAddress && ownerAddress && connectedAddress.toLowerCase() === ownerAddress.toLowerCase() && (
          <div className="bg-base-100 rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Create Proposal</h2>

            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Enter proposal name"
                value={proposalName}
                onChange={e => setProposalName(e.target.value)}
                className="input input-bordered w-full"
              />
              <button onClick={handleCreateProposal} className="btn btn-primary">
                Add Proposal
              </button>
            </div>
          </div>
        )}

        <div className="bg-base-100 rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Proposals</h2>

          {proposalIds.length === 0 ? (
            <p>No proposals yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {proposalIds.map(id => (
                <ProposalCard
                  key={`${id}-${refreshKey}`}
                  proposalId={id}
                  onVote={handleVote}
                  connectedAddress={connectedAddress}
                />
              ))}
            </div>
          )}
        </div>

        {message && (
          <div className="alert alert-info mt-6">
            <span>{message}</span>
          </div>
        )}
      </div>
    </main>
  );
}

function ProposalCard({
  proposalId,
  onVote,
  connectedAddress,
}: {
  proposalId: number;
  onVote: (proposalId: number) => Promise<void>;
  connectedAddress?: string;
}) {
  const [proposal, setProposal] = useState<Proposal | null>(null);

  const { data, refetch } = useScaffoldReadContract({
    contractName: "VotingDapp",
    functionName: "getProposal",
    args: [BigInt(proposalId)],
  });

  useEffect(() => {
    if (data) {
      const proposalData = data as [bigint, string, bigint];
      setProposal({
        id: proposalData[0],
        name: proposalData[1],
        voteCount: proposalData[2],
        exists: true,
      });
    }
  }, [data]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (!proposal) {
    return (
      <div className="card bg-base-200 shadow-md">
        <div className="card-body">
          <p>Loading proposal {proposalId}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-200 shadow-md">
      <div className="card-body">
        <h3 className="card-title">
          #{proposal.id.toString()} - {proposal.name}
        </h3>
        <p>Total Votes: {proposal.voteCount.toString()}</p>

        <div className="card-actions justify-end mt-4">
          <button onClick={() => onVote(proposalId)} className="btn btn-secondary" disabled={!connectedAddress}>
            Vote
          </button>
        </div>
      </div>
    </div>
  );
}
