// Hard coded layouts at certain points
const layouts = {
  5: [
    [0, 4],
    [90, 1],
  ],
  6: [
    [0, 5],
    [90, 1],
  ],
  7: [
    [0, 6],
    [90, 1],
  ],
  8: [
    [0, 4],
    [45, 3],
    [90, 1],
  ],
  9: [
    [0, 5],
    [45, 3],
    [90, 1],
  ],
  10: [
    [0, 6],
    [45, 3],
    [90, 1],
  ],
  13: [
    [0, 8],
    [45, 4],
    [90, 1],
  ],
  16: [
    [0, 10],
    [45, 5],
    [90, 1],
  ],
  17: [
    [0, 8],
    [30, 5],
    [60, 3],
    [90, 1],
  ],
  21: [
    [0, 10],
    [30, 6],
    [60, 4],
    [90, 1],
  ],
  25: [
    [0, 12],
    [30, 8],
    [60, 4],
    [90, 1],
  ],
  26: [
    [0, 10],
    [22.5, 8],
    [45, 5],
    [67.5, 2],
    [90, 1],
  ],
  27: [
    [0, 10],
    [22.5, 8],
    [45, 6],
    [67.5, 2],
    [90, 1],
  ],
  28: [
    [0, 10],
    [22.5, 8],
    [45, 6],
    [67.5, 3],
    [90, 1],
  ],
  29: [
    [0, 11],
    [22.5, 8],
    [45, 6],
    [67.5, 3],
    [90, 1],
  ],
  30: [
    [0, 11],
    [22.5, 9],
    [45, 6],
    [67.5, 3],
    [90, 1],
  ],
  31: [
    [0, 11],
    [22.5, 9],
    [45, 7],
    [67.5, 3],
    [90, 1],
  ],
  41: [
    [0, 16],
    [22.5, 12],
    [45, 8],
    [67.5, 4],
    [90, 1],
  ],
};

function isObjKey<T extends object>(key: PropertyKey, obj: T): key is keyof T {
  return key in obj;
}

export function calculateSpeakerPositions(
  numSpeakers: number,
  isHorizontalOnly: boolean,
  isHighFrontDensity: boolean
) {
  
  let positions: number[][] = [];
  
  if (isHorizontalOnly) {
    positions = Array.from({ length: numSpeakers }, (_, i) => [
      i * (360 / numSpeakers),
      0,
    ]);
  }

  if (!isHorizontalOnly && isObjKey(numSpeakers, layouts)) {
    positions = layouts[numSpeakers].flatMap(([elevation, count]) =>
      Array.from({ length: count }, (_, i) => [i * (360 / count), elevation])
    );
  }

  if (!isHorizontalOnly && !isObjKey(numSpeakers, layouts)) {
    let layout = [];
    const numRings = Math.max(
      3,
      Math.min(8, Math.floor(Math.sqrt(numSpeakers / 2)))
    );
    const elevationStep = 90 / (numRings - 1);

    for (let i = 0; i < numRings; i++) {
      const elevation = i * elevationStep;
      const ringRadius = Math.sin(((90 - elevation) * Math.PI) / 180);
      let speakersInRing;

      if (i === numRings - 1) {
        speakersInRing = elevation === 90 ? 1 : 2;
      } else {
        speakersInRing = Math.max(
          3,
          Math.round((ringRadius * numSpeakers) / 2)
        );
      }

      layout.push([elevation, speakersInRing]);
    }

    for (let i = 1; i < layout.length; i++) {
      if (layout[i][1] >= layout[i - 1][1]) {
        layout[i][1] = Math.max(2, layout[i - 1][1] - 1);
      }
    }

    let total = layout.reduce((sum, [_, count]) => sum + count, 0);
    let diff = numSpeakers - total;

    while (diff !== 0) {
      for (let i = 0; i < layout.length - 1 && diff !== 0; i++) {
        if (diff > 0 || (diff < 0 && layout[i][1] > 3)) {
          layout[i][1] += Math.sign(diff);
          diff -= Math.sign(diff);
        }
      }
    }

    positions = layout.flatMap(([elevation, count]) =>
      Array.from({ length: count }, (_, i) => [i * (360 / count), elevation])
    );
  }

  if (isHighFrontDensity) {
    return redistributeForHighFrontDensity(positions);
  }

  return positions;
}

function redistributeForHighFrontDensity(positions: number[][]) {
  // Gruppiere die Positionen nach Elevation
  const elevationGroups = positions.reduce(
    (groups: { [key: number]: number[] }, [azimuth, elevation]) => {
      if (!groups[elevation]) groups[elevation] = [];
      groups[elevation].push(azimuth);
      return groups;
    },
    {}
  );

  const newPositions: number[][] = [];

  Object.entries(elevationGroups).forEach(([elevation, azimuths]) => {
    const count = azimuths.length;
    const frontCount = Math.ceil(count * 0.6);
    const backCount = count - frontCount;

    const frontAzimuths = [];
    const backAzimuths = [];

    // Verteile die Azimuth-Winkel im vorderen Bereich (-90° bis +90°)
    for (let i = 0; i < frontCount; i++) {
      frontAzimuths.push(-90 + (180 * i) / (frontCount - 1));
    }

    // Verteile die Azimuth-Winkel im hinteren Bereich (+90° bis +270°)
    for (let i = 0; i < backCount; i++) {
      backAzimuths.push(90 + (180 * i) / (backCount - 1));
    }

    // Kombiniere und normalisiere die Azimuth-Winkel
    const newAzimuths = [...frontAzimuths, ...backAzimuths]
      .map((azimuth) => (azimuth + 360) % 360)
      .sort((a, b) => a - b);

    // Füge die neuen Positionen hinzu
    newPositions.push(
      ...newAzimuths.map((azimuth) => [azimuth, parseFloat(elevation)])
    );
  });

  // Sortiere die finalen Positionen nach Elevation und dann nach Azimuth
  return newPositions.sort(
    (a: number[], b: number[]) => a[1] - b[1] || a[0] - b[0]
  );
}

export function getColor(
  elevation: number,
  azimuth: number,
  isHighFrontDensity: boolean
) {
  const colors = [
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "purple",
    "pink",
    "cyan",
    "magenta",
  ];
  const maxElevation = 90;
  let index = Math.floor((elevation / maxElevation) * (colors.length - 1));

  if (isHighFrontDensity && (azimuth < -90 || azimuth > 90)) {
    return colors[index] + "88"; // 88 für 50% Transparenz in Hex
  }

  return colors[index];
}

export function downloadJSON(
  positions: number[][],
  isHorizontalOnly: boolean,
  isHighFrontDensity: boolean
) {
  const layout = {
    Name: "All-Round Ambisonic decoder (AllRAD) and loudspeaker layout",
    Description:
      "This configuration file was created with a custom JavaScript application.",
    LoudspeakerLayout: {
      Name: "A loudspeaker layout",
      Loudspeakers: positions.map(([azimuth, elevation], i) => ({
        Azimuth: azimuth,
        Elevation: elevation,
        Radius: 1.0,
        IsImaginary: false,
        Channel: i + 1,
        Gain: 1.0,
      })),
    },
  };

  // Finde den kleinsten Azimuth-Winkel für die imaginären Lautsprecher
  const minAzimuth = Math.min(...positions.map(([azimuth]) => azimuth));

  // Füge imaginären Lautsprecher bei -90° Elevation hinzu
  layout.LoudspeakerLayout.Loudspeakers.push({
    Azimuth: minAzimuth,
    Elevation: -90,
    Radius: 1.0,
    IsImaginary: true,
    Channel: positions.length + 1,
    Gain: 0.0,
  });

  // Füge imaginären Lautsprecher bei 90° Elevation hinzu, wenn im horizontalen Modus oder bei höherer Frontdichte
  if (isHorizontalOnly || isHighFrontDensity) {
    layout.LoudspeakerLayout.Loudspeakers.push({
      Azimuth: minAzimuth,
      Elevation: 90,
      Radius: 1.0,
      IsImaginary: true,
      Channel: positions.length + 2,
      Gain: 0.0,
    });
  }

  const jsonString = JSON.stringify(layout, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "speaker_layout.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function deg2rad(num: number) {
  return num * (Math.PI / 180);
}

export function rad2deg(num: number) {
  return num / (Math.PI / 180);
}

export function aed2xyz([a, e, d]: [a: number, e: number, d: number]) {
  // SPAT AED Format
  const er = deg2rad(e);
  const ar = deg2rad(a);
  const x = d * Math.cos(er) * Math.sin(ar);
  const y = d * Math.cos(er) * Math.cos(ar);
  const z = d * Math.sin(er);
  return [x, y, z] as [x: number, y: number, z:number];
}

export function xyz2aed([x, y, z]: [x: number, y: number, z: number]) {
  // SPAT AED Format
  const d = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
  const a = 90 - rad2deg(Math.atan2(y, x));
  const e = rad2deg(Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))));
  return [a, e, d];
}

export function roundSF(num: number, n: number) {
  if (num === 0) {
    return 0;
  }

  const d = Math.ceil(Math.log10(Math.abs(num)));
  const power = n - d;

  const magnitude = Math.pow(10, power);
  const shifted = Math.round(num * magnitude);

  return shifted / magnitude;
}
