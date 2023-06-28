/* eslint-disable react/jsx-no-undef */

import { useRef } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import {
  InstanceOf,
  makeBorderMaterial,
  makeCursorMaterial,
  makeFadeMaterial,
  makeHighlightMaterial,
} from "@coconut-xr/xmaterials";
import {
  BufferAttribute,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PlaneGeometry,
} from "three";
import { Environment, OrbitControls } from "@react-three/drei";

const MeshFadeBasicMaterial = makeFadeMaterial(MeshBasicMaterial, { color: "blue" });
const MeshCursorBasicMaterial = makeCursorMaterial(MeshBasicMaterial);
const MeshHighlightBorderPhysicalMaterial = makeHighlightMaterial(
  makeBorderMaterial(MeshPhysicalMaterial),
);

extend({
  MeshHighlightBorderPhysicalMaterial,
  MeshFadeBasicMaterial,
  MeshCursorBasicMaterial,
});

const planeWithTangetGeometry = new PlaneGeometry();
const position = planeWithTangetGeometry.getAttribute("position");
const array = new Float32Array((4 * position.array.length) / position.itemSize);
const tangent = [1, 0, 0, 1];
for (let i = 0; i < array.length; i++) {
  array[i] = tangent[i % 4];
}
planeWithTangetGeometry.setAttribute("tangent", new BufferAttribute(array, 4));

export default function Index() {
  return (
    <Canvas
      dpr={1}
      gl={{ localClippingEnabled: true, logarithmicDepthBuffer: true }}
      style={{ width: "100vw", height: "100svh", touchAction: "none" }}
    >
      <App />
    </Canvas>
  );
}

function App() {
  const materialRef = useRef<InstanceOf<typeof MeshHighlightBorderPhysicalMaterial>>(null);
  const meshRef = useRef<Mesh>(null);
  useFrame((state) => {
    if (meshRef.current == null || materialRef.current == null) {
      return;
    }
    meshRef.current.position.x = Math.sin(state.clock.getElapsedTime() * 1) + 2;
    meshRef.current.position.z = Math.cos(state.clock.getElapsedTime() * 1);
    meshRef.current.getWorldPosition(materialRef.current.position1);
  });
  return (
    <>
      <OrbitControls />
      <Environment preset="city" background />
      <pointLight intensity={10} color="white" position={[10, 10, 1]} />
      <mesh position={[0, -2, 0]} scale={[1, 1, 1]}>
        <boxGeometry />
        <meshPhongMaterial color="blue" />
      </mesh>
      <mesh position={[0, 0, 0.5]} scale={[0.1, 0.1, 1]}>
        <boxGeometry />
        <meshFadeBasicMaterial transparent />
      </mesh>
      <mesh scale={4} position={[2.5, 0, 0]} geometry={planeWithTangetGeometry}>
        <meshHighlightBorderPhysicalMaterial
          ref={materialRef}
          transparent
          toneMapped
          borderRadius={[0.1, 0.1, 0.1, 0.1]}
          borderSize={[0.02, 0.02, 0.02, 0.02]}
          borderColor={[1, 1, 1]}
          borderBend={0.3}
          specular="white"
          color={[1, 1, 1]}
          borderOpacity={1}
          transmission={0.9}
          roughness={0.3}
        />
      </mesh>

      <mesh ref={meshRef} scale={[0.1, 0.1, 0.1]}>
        <boxGeometry />
        <meshBasicMaterial transparent color="blue" />
      </mesh>

      <mesh position={[0, 0, 0.01]} scale={2}>
        <planeGeometry />
        <meshCursorBasicMaterial opacity={1.1} transparent color="white" />
      </mesh>
    </>
  );
}
