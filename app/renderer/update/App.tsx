import { useFitWindow } from "@renderer/utils/hooks";
import { ComponentRef } from "react";
import ProgressBar from "./components/progressBar";

function App(): JSX.Element {
  const ref = useFitWindow<ComponentRef<"div">>([]);

  return (
    <>
      <div ref={ref} className="px-4 py-3">
        <h2 className="mb-2">Downloading The Update ...</h2>
        <ProgressBar />
      </div>
    </>
  );
}

export default App;
