/* eslint-disable @typescript-eslint/no-misused-new */
import { Material, Shader, Vector3, Vector4, WebGLRenderer } from "three";
import { Constructor } from "./index.js";

export function makeBorderMaterial<T extends Constructor<Material>>(MaterialClass: T) {
  return class extends MaterialClass {
    shader?: Shader;

    readonly borderRadius = new Vector4(0, 0, 0, 0);
    readonly borderColor = new Vector3(0, 0, 0);
    readonly borderSize = new Vector4(0, 0, 0, 0);
    public _borderOpacity = 1;
    public _ratio = 1;
    public _borderBend = 0.5;

    constructor(...args: Array<any>) {
      super(...args);
      if (this.defines == null) {
        this.defines = {};
      }
      this.defines.USE_UV = "";
      this.defines.USE_TANGENT = "";
    }

    set borderBend(value: number) {
      this._borderBend = value;
      if (this.shader != null) {
        this.shader.uniforms.borderBend.value = value;
      }
    }

    get borderBend(): number {
      return this._borderBend;
    }

    set borderOpacity(value: number) {
      this._borderOpacity = value;
      if (this.shader != null) {
        this.shader.uniforms.borderOpacity.value = value;
      }
    }

    get borderOpacity(): number {
      return this._borderOpacity;
    }
    set ratio(value: number) {
      this._ratio = value;
      if (this.shader != null) {
        this.shader.uniforms.ratio.value = value;
      }
    }

    get ratio(): number {
      return this._ratio;
    }
    onBeforeCompile(shader: Shader, renderer: WebGLRenderer): void {
      super.onBeforeCompile(shader, renderer);
      this.shader = shader;
      compileBorderMaterial(
        shader,
        this.borderRadius,
        this.borderColor,
        this._borderOpacity,
        this.borderSize,
        this._ratio,
        this._borderBend,
      );
    }
  };
}

export function compileBorderMaterial(
  shader: Shader,
  borderRadius: Vector4, //top-left, top-right, bottom-right, bottom-left
  borderColor: Vector3,
  borderOpacity: number,
  borderSize: Vector4, //top, right, bottom, left
  ratio: number,
  borderBend: number,
) {
  shader.uniforms.borderRadius = { value: borderRadius }; //top-left, top-right, bottom-right, bottom-left
  shader.uniforms.borderColor = { value: borderColor };
  shader.uniforms.borderOpacity = { value: borderOpacity };
  shader.uniforms.borderSize = { value: borderSize }; //top, right, bottom, left
  shader.uniforms.ratio = { value: ratio };
  shader.uniforms.borderBend = { value: borderBend };

  shader.fragmentShader =
    `uniform float ratio;
              uniform float borderOpacity;
              uniform vec3 borderColor;
              uniform vec4 borderSize;
              uniform float borderBend;
          uniform vec4 borderRadius;
          float min4 (vec4 v) {
              return min(min(min(v.x,v.y),v.z),v.w);
          }
          vec2 radiusDistance(float radius, vec2 outside, vec2 border, vec2 borderSize) {
              vec2 outerRadiusXX = vec2(radius, radius);
              vec2 innerRadiusXX = outerRadiusXX - borderSize;
              vec2 radiusWeightUnnormalized = abs(innerRadiusXX - border);
              vec2 radiusWeight = radiusWeightUnnormalized / vec2(radiusWeightUnnormalized.x + radiusWeightUnnormalized.y);
              return vec2(
                  radius - distance(outside, outerRadiusXX),
                  dot(radiusWeight, innerRadiusXX) - distance(border, innerRadiusXX)
              );
          }
          ` + shader.fragmentShader;

  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <clipping_planes_fragment>",
    `vec4 v_outsideDistance = vec4(1.0 - vUv.y, (1.0 - vUv.x) * ratio, vUv.y, vUv.x * ratio);
      vec4 v_borderDistance = v_outsideDistance - borderSize;

      vec2 dist = vec2(min4(v_outsideDistance), min4(v_borderDistance));

      if(all(lessThan(v_outsideDistance.xw, borderRadius.xx))) {
          dist = radiusDistance(borderRadius.x, v_outsideDistance.xw, v_borderDistance.xw, borderSize.xw);
          
      } else if(all(lessThan(v_outsideDistance.xy, borderRadius.yy))) {
          dist = radiusDistance(borderRadius.y, v_outsideDistance.xy, v_borderDistance.xy, borderSize.xy);

      } else if(all(lessThan(v_outsideDistance.zy, borderRadius.zz))) {
          dist = radiusDistance(borderRadius.z, v_outsideDistance.zy, v_borderDistance.zy, borderSize.zy);

      } else if(all(lessThan(v_outsideDistance.zw, borderRadius.ww))) {
          dist = radiusDistance(borderRadius.w, v_outsideDistance.zw, v_borderDistance.zw, borderSize.zw);
      }

      #include <clipping_planes_fragment>`,
  );
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <normal_fragment_maps>",
    `#include <normal_fragment_maps>
      vec4 directionWeights = normalize(max(vec4(0.0), v_outsideDistance - 0.5));
      mat4 directions = mat4(vec4(-bitangent, 1.0), vec4(-tangent, 1.0), vec4(bitangent, 1.0), vec4(tangent, 1.0));
      float outsideNormalWeight = max(0.0, -dist.y / (dist.x - dist.y)) * borderBend;
      vec3 outsideNormal = (directionWeights * transpose(directions)).xyz;
      normal = normalize(outsideNormalWeight * outsideNormal + (1.0 - outsideNormalWeight) * normal);
  `,
  );
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <color_fragment>",
    `#include <color_fragment>
              
    float ddx = fwidth(dist.x);
    float outer = smoothstep(-ddx, ddx, dist.x);

    float ddy = fwidth(dist.y);
    float inner = smoothstep(-ddy, ddy, dist.y);

    float transition = 1.0 - step(0.1, outer - inner) * (1.0 - inner);

    diffuseColor.rgb = mix(borderColor, diffuseColor.rgb, transition);

    diffuseColor.a = outer * mix(borderOpacity, diffuseColor.a, transition);
    
          `,
  );
}
