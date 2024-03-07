import { useStudioState } from "@/store/studioState";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";

const RecordSettings = () => {
  const { isRecordAudio, setIsRecordAudio, isRecordVideo, setIsRecordVideo } =
    useStudioState();

  return (
    <Card className="w-96 max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl">Recording</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <button
            className="flex items-center gap-2"
            onClick={() => setIsRecordVideo(!isRecordVideo)}
          >
            <Checkbox checked={isRecordVideo} />
            <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Record Seperate Video
            </span>
          </button>
          <button
            className="flex items-center gap-2"
            onClick={() => setIsRecordAudio(!isRecordAudio)}
          >
            <Checkbox checked={isRecordAudio} />
            <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Record Seperate Audio
            </span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordSettings;
