import { useRemotePeer } from "@huddle01/react/hooks";
import { Role } from "@huddle01/server-sdk/auth";
import { useStudioState } from "@/store/studioState";
import { PeerMetadata } from "@/utils/types";
import { Button } from "./ui/button";

type AcceptRequestProps = {
  peerId: string;
};

const AcceptRequest: React.FC<AcceptRequestProps> = ({ peerId }) => {
  const { metadata, updateRole } = useRemotePeer<PeerMetadata>({ peerId });

  const { setShowAcceptRequest, removeRequestedPeers } = useStudioState();

  return (
    <div className="inline-flex bg-gray-900 p-4 flex-col justify-center items-center rounded-lg bg-custom-2 z-50">
      <div className="flex flex-col justify-center items-start gap-2">
        <div className="flex text-3xl font-semibold items-center justify-center w-12 h-12 bg-gray-700 text-gray-200 rounded-full">
          {metadata?.displayName?.[0].toUpperCase()}
        </div>
        <div className="font-inter text-sm font-semibold text-slate-100">
          {metadata?.displayName} requested to be a speaker
        </div>
        <div className="font-inter text-xs text-slate-100">
          You can view all the requests in the sidebar
        </div>
        <div className="flex items-start gap-2">
          <Button
            className="bg-gray-700 hover:bg-gray-600 text-gray-200"
            onClick={() => {
              updateRole(Role.CO_HOST);
              setShowAcceptRequest(false);
              removeRequestedPeers(peerId);
            }}
          >
            Accept
          </Button>
          <Button
            className="text-white bg-red-500 hover:bg-red-400"
            onClick={() => {
              setShowAcceptRequest(false);
              removeRequestedPeers(peerId);
            }}
          >
            Deny
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AcceptRequest;
