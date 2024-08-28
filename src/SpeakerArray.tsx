"use client";
import React, { useEffect, useState } from "react";
import SpeakerSource from "./SpeakerSource";

function SpeakerArray({
  speakerSize,
  pos,
}: {
  speakerSize: number;
  pos: [x:number, y:number, z:number][] | undefined;
}) {
  const [speakerArr, setSpeakerArr] = useState<Array<React.JSX.Element>>([]);

  useEffect(() => {
    if (!pos) return
    const out: Array<React.JSX.Element> = [];
    pos.forEach((xyz, i) => {
      const ind = i + 1;
      out.push(
        <SpeakerSource
          index={ind}
          key={"speaker-" + ind}
          speakerSize={speakerSize}
          pos={xyz}
        />
      );
    })

    setSpeakerArr(out);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, speakerSize]);
  return <>{speakerArr}</>;
}

export default SpeakerArray;
