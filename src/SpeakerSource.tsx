"use client";
import { useMemo } from "react";
import { Center, Text3D } from "@react-three/drei";

export default function SpeakerSource({
  index,
  speakerSize,
  pos,
  color,
}: {
  index: number;
  speakerSize: number;
  pos: [x: number, y: number, z: number];
  color: string;
}) {

  const size = useMemo(() => speakerSize / 1, [speakerSize]);


  return (
    <mesh frustumCulled={false} position={pos}>
      <boxGeometry args={[size, size, size]} />
      <meshPhongMaterial transparent={true} opacity={0.5} color={color}/>
      <Center>
        <Text3D size={size * 0.5} height={0.01} font={"HKGrotesk_Bold.json"}>
          <meshPhongMaterial depthWrite={false} />
          {index}
        </Text3D>
      </Center>
    </mesh>
  );
}
