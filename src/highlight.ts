import { Material, Shader, Vector3, WebGLRenderer } from "three";
import { Constructor } from "./index.js";

export function makeHighlightMaterial<T extends Constructor<Material>>(MaterialClass: T) {
  return class extends MaterialClass {
    shader?: Shader;

    _position1 = new Vector3(Infinity, Infinity, Infinity);
    _position2 = new Vector3(Infinity, Infinity, Infinity);
    _highlightOpacity = 1;
    _highlightDistance = 1;
    highlightColor = new Vector3(1, 1, 1);

    get highlightDistance() {
      return this._highlightDistance;
    }

    set highlightDistance(value: number) {
      this._highlightDistance = value;
      if (this.shader != null) {
        this.shader.uniforms.highlightDistance.value = value;
      }
    }

    get highlightOpacity() {
      return this._highlightOpacity;
    }

    set highlightOpacity(value: number) {
      this._highlightOpacity = value;
      if (this.shader != null) {
        this.shader.uniforms.highlightOpacity.value = value;
      }
    }

    get position1() {
      return this._position1;
    }

    set position1(value: Vector3) {
      this._position1 = value;
      if (this.shader != null) {
        this.shader.uniforms.position1.value = value;
      }
    }

    get position2() {
      return this._position2;
    }

    set position2(value: Vector3) {
      this._position2 = value;
      if (this.shader != null) {
        this.shader.uniforms.position2.value = value;
      }
    }

    onBeforeCompile(shader: Shader, renderer: WebGLRenderer): void {
      super.onBeforeCompile(shader, renderer);
      compileHighlightMaterial(
        shader,
        this._position1,
        this._position2,
        this._highlightOpacity,
        this.highlightColor,
        this._highlightDistance,
      );
    }
  };
}

export function compileHighlightMaterial(
  shader: Shader,
  position1: Vector3,
  position2: Vector3,
  highlightOpacity: number,
  highlightColor: Vector3,
  highlightDistance: number,
) {
  shader.uniforms.position1 = { value: position1 };
  shader.uniforms.position2 = { value: position2 };
  shader.uniforms.highlightOpacity = { value: highlightOpacity };
  shader.uniforms.highlightColor = { value: highlightColor };
  shader.uniforms.highlightDistance = { value: highlightDistance };

  shader.vertexShader =
    `#define DISTANCE
  varying vec3 vHighlightWorldPosition;\n` + shader.vertexShader;
  shader.vertexShader = shader.vertexShader.replace(
    "#include <fog_vertex>",
    `#include <fog_vertex>
    vHighlightWorldPosition = worldPosition.xyz;`,
  );
  shader.fragmentShader =
    `varying vec3 vHighlightWorldPosition;
  uniform vec3 position1;
  uniform vec3 position2;
  uniform float highlightOpacity;
  uniform vec3 highlightColor;
  uniform float highlightDistance;\n` + shader.fragmentShader;
  shader.fragmentShader = shader.fragmentShader.replace(
    /}\s*$/,
    `   float v1 = max(0.0, 1.0 - length(vHighlightWorldPosition - position1) / highlightDistance);
        float v2 = max(0.0, 1.0 - length(vHighlightWorldPosition - position2) / highlightDistance);
        float intensity = v1 * v1 + v2 * v2;
        gl_FragColor.rgb += intensity * highlightColor * highlightOpacity;
        gl_FragColor.a += intensity * highlightOpacity;
    }`,
  );
}
