"use client";

import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { AdditiveBlending, Vector3 } from "three";

const vertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;
void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vPosition = worldPos.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec3 vNormal;
varying vec3 vPosition;
uniform vec3 uCameraPos;
void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(uCameraPos - vPosition);
  float fresnel = 1.0 - abs(dot(normal, viewDir));
  fresnel = pow(fresnel, 3.5);
  vec3 color = mix(vec3(0.15, 0.4, 0.85), vec3(0.35, 0.65, 1.0), fresnel);
  gl_FragColor = vec4(color, fresnel * 0.65);
}
`;

export default function Atmosphere() {
  const { camera } = useThree();

  const uniforms = useMemo(() => ({
    uCameraPos: { value: new Vector3(0, 0, 2.5) },
  }), []);

  useFrame(() => {
    uniforms.uCameraPos.value.copy(camera.position);
  });

  return (
    <mesh>
      <sphereGeometry args={[1.03, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </mesh>
  );
}
