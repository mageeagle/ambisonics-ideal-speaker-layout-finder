import { CameraControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import {
  aed2xyz,
  calculateSpeakerPositions,
  downloadJSON,
  getColor,
} from "./functions";
import SpeakerArray from "./SpeakerArray";
const smallButton =
  "p-2 border-2 border-gray-200 rounded-md mr-8 mt-4 hover:bg-gray-50 active:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-300";
function App() {
  const [numSpeakers, setNumSpeakers] = useState(10);
  const [radius, setRadius] = useState(1);
  const [isHorizontalOnly, setIsHorizontalOnly] = useState(false);
  const [isHighFrontDensity, setIsHighFrontDensity] = useState(false);
  const [positions, setPositions] = useState<number[][]>([]);
  const [colorArr, setColorArr] = useState<string[]>([]);
  const [speakerDisplay, setSpeakerDisplay] =
    useState<Array<React.JSX.Element>>();
  const [speakerXYZ, setSpeakerXYZ] =
    useState<[x: number, y: number, z: number][]>();

  useEffect(() => {
    if (!numSpeakers) return;
    if (numSpeakers < 5) return;
    setPositions(
      calculateSpeakerPositions(
        numSpeakers,
        isHorizontalOnly,
        isHighFrontDensity
      )
    );
  }, [numSpeakers, isHorizontalOnly, isHighFrontDensity]);

  useEffect(() => {
    if (!positions || !radius) return;
    const output: [x: number, y: number, z: number][] = [];
    const color: string[] = [];
    positions.forEach(([a, e]) => {
      output.push(aed2xyz([a, e, radius]));
      color.push(getColor(e, a, isHighFrontDensity));
    });
    setSpeakerXYZ(output);
    setColorArr(color)
  }, [positions, radius]);

  useEffect(() => {
    if (!speakerXYZ || !speakerXYZ[0]) return;
    const out: Array<React.JSX.Element> = [];
    for (let i = 0; i < numSpeakers; i++) {
      out.push(
        <tr>
          <td>{i + 1}</td>
          <td>{positions[i][0].toFixed(3)}</td>
          <td>{positions[i][1].toFixed(3)}</td>
          <td>{speakerXYZ[i][0].toFixed(3)}</td>
          <td>{speakerXYZ[i][1].toFixed(3)}</td>
          <td>{speakerXYZ[i][2].toFixed(3)}</td>
        </tr>
      );
    }
    setSpeakerDisplay(out);
  }, [speakerXYZ]);

  return (
    <div className="grid grid-cols-2 h-full w-screen bg-gray-600 text-white">
      <div className="h-screen" id="canvas-container">
        <Canvas>
          <directionalLight color="white" position={[1, 1, 1]} />
          <CameraControls />
          <SpeakerArray
            speakerSize={radius * 0.1}
            pos={speakerXYZ}
            color={colorArr}
          />
        </Canvas>
      </div>
      <div className="p-4" id="infoContainer">
        <h2 className="p-4 font-bold">Simple Ambisonics Loudspeaker Distribution Finder</h2>
        <div className="px-4">By Jakob Gille and Eagle Wu</div>
        <a className="px-4 underline" href="https://github.com/mageeagle/ambisonics-ideal-speaker-layout-finder">Github Source</a>
        <div className="px-4">Always check the layouts after implementing them in your setup as there might be some that are not perfect.</div>
        <div className="px-4">Higher speaker density in front works for the time being mostly for horizontal layouts.</div>
        <div className="px-4">You can zoom and drag the visualisation to change the perspective.</div>
        <div className="p-2">
          <text className="p-2">Enter number of speakers:</text>
          <input
            className="p-2 text-black"
            type="number"
            min="5"
            onChange={(e) => setNumSpeakers(Number(e.target.value))}
            value={numSpeakers}
          />
          <text className="p-2">Radius:</text>
          <input
            className="p-2 text-black"
            type="number"
            min="1"
            onChange={(e) => setRadius(Number(e.target.value))}
            value={radius}
          />
        </div>
        <div className="p-2">
          <button
            className={smallButton}
            onClick={() => setIsHighFrontDensity((s) => !s)}
          >
            Higher speaker density in front
          </button>
          <button
            className={smallButton}
            onClick={() => setIsHorizontalOnly((s) => !s)}
          >
            Toggle horizontal layer
          </button>
          <button
            className={smallButton}
            onClick={() =>
              downloadJSON(positions, isHorizontalOnly, isHighFrontDensity)
            }
          >
            Download JSON for Decoder
          </button>
        </div>
        <table className="table-fixed w-full" id="speakerTable">
          <thead>
            <tr className="text-left">
              <th>No.</th>
              <th>Azimuth</th>
              <th>Elevation</th>
              <th>X</th>
              <th>Y</th>
              <th>Z</th>
            </tr>
          </thead>
          <tbody>{speakerDisplay}</tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
