import { Material, Shader, WebGLRenderer } from "three";
import { Constructor, FirstConstructorParameter } from "./index.js";

export function makeCursorMaterial<T extends Constructor<Material>>(
  MaterialClass: T,
  defaultProperties?: FirstConstructorParameter<T>,
) {
  return class extends MaterialClass {
    constructor(...args: Array<any>) {
      super({ ...defaultProperties, ...args[0] }, ...args.slice(1));
    }
    onBeforeCompile(shader: Shader, renderer: WebGLRenderer): void {
      super.onBeforeCompile(shader, renderer);
      compileCursorMaterial(shader);
    }
  };
}

export function compileCursorMaterial(shader: Shader): void {
  shader.vertexShader = `varying vec2 vLocalPosition;\n` + shader.vertexShader;
  shader.vertexShader = shader.vertexShader.replace(
    `#include <color_vertex>`,
    `#include <color_vertex>
    vLocalPosition = position.xy * 2.0;`,
  );
  shader.fragmentShader = `varying vec2 vLocalPosition;\n` + shader.fragmentShader;
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <color_fragment>",
    `#include <color_fragment>
      float value = max(0.0, 1.0 - sqrt(dot(vLocalPosition, vLocalPosition)));
      diffuseColor.a = diffuseColor.a * value * value;`,
  );
}
