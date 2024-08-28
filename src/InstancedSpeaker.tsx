"use client";
import {
  MeshLambertMaterial,
  InstancedMesh,
  BoxGeometry,
  Matrix4,
} from "three";
import { useEffect, useRef } from "react";
import { aed2xyz } from "./functions";
// import { useFrame } from "@react-three/fiber";

export default function InstancedSpeaker({
  pos,
  radius,
}: {
  pos: number[][];
  radius: number;
}) {
  const ref = useRef<InstancedMesh>(null);
  const matrixRef = useRef(new Matrix4());

  useEffect(() => {
    if (!pos || !ref.current) return;
    
    pos.forEach(([azimuth, elevation], index) => {
      const aed = aed2xyz([azimuth, elevation, radius]);
      console.log(aed);
      matrixRef.current.setPosition(aed[0], aed[1], aed[2]);
      if (ref.current) ref.current.setMatrixAt(index, matrixRef.current);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    // ref.current.instanceColor.needsUpdate = true;
  }, [pos]);

  return (
    <>
      <instancedMesh
        ref={ref}
        args={[geo, mat, 100]}
        count={100}
        frustumCulled={false}
      />
    </>
  );
}
const geo = new BoxGeometry(0.1, 0.1, 0.1);
const mat = new MeshLambertMaterial();
