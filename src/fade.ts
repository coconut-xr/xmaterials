import { Material, Shader, WebGLRenderer } from "three";
import { Constructor, FirstConstructorParameter } from "./index.js";

export function makeFadeMaterial<T extends Constructor<Material>>(
  MaterialClass: T,
  defaultProperties?: FirstConstructorParameter<T>,
) {
  return class extends MaterialClass {
    constructor(...args: Array<any>) {
      super({ ...defaultProperties, ...args[0] }, ...args.slice(1));
    }
    onBeforeCompile(shader: Shader, renderer: WebGLRenderer): void {
      super.onBeforeCompile(shader, renderer);
      compileFadeMaterial(shader);
    }
  };
}

export function compileFadeMaterial(shader: Shader) {
  shader.vertexShader = `varying float vFade;\n` + shader.vertexShader;
  shader.vertexShader = shader.vertexShader.replace(
    `#include <color_vertex>`,
    `#include <color_vertex>
    vFade = position.z + 0.5;`,
  );
  shader.fragmentShader = `varying float vFade;\n` + shader.fragmentShader;
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <color_fragment>",
    `#include <color_fragment>
      diffuseColor.a *= vFade;`,
  );
}
