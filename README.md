# @coconut-xr/xmaterials


[![Version](https://img.shields.io/npm/v/@coconut-xr/xmaterials?style=flat-square)](https://npmjs.com/package/@coconut-xr/xmaterials)
[![License](https://img.shields.io/github/license/coconut-xr/xmaterials.svg?style=flat-square)](https://github.com/coconut-xr/xmaterials/blob/master/LICENSE)
[![Twitter](https://img.shields.io/twitter/follow/coconut_xr?style=flat-square)](https://twitter.com/coconut_xr)
[![Discord](https://img.shields.io/discord/1087727032240185424?style=flat-square&label=discord)](https://discord.gg/RbyaXJJaJM)

`npm i @coconut-xr/xmaterials`

_A collection of materials for interactive immersive experiences._

# Usage

**with Three.js**

```ts
const MeshFadeBasicMaterial = makeFadeMaterial(MeshBasicMaterial);
const mesh = new Mesh(
  new BoxGeometry(),
  new MeshFadeBasicMaterial({ transparent: true, color: "blue" }),
);
mesh.scale(0.1, 0.1, 1);
```

**with R3F**

```tsx
const MeshFadeBasicMaterial = makeFadeMaterial(MeshBasicMaterial);
extend({ MeshFadeBasicMaterial });

<mesh scale={[0.1, 0.1, 1]}>
  <boxGeometry />
  <meshFadeBasicMaterial transparent color="blue" />
</mesh>;
```

# Materials

- **makeCursorMaterial** - _creates a radial opacity effect on a plane_

- **makeBorderMaterial** - _displays a border with various effects on a plane_
  - borderRadius - radius of the corners (_top-left, top-right, bottom-right, bottom-left_) - default is `(0, 0, 0, 0)`
  - borderColor - color of the border - default is `(0, 0, 0)`
  - borderSize - size of the border on all edges (_top, right, bottom, left_) - default is `(0, 0, 0, 0)`
  - borderOpacity - opacity of the border (requires `transparent=true`) - default is `1`
  - ratio - aspect ratio of the target plane - default is `1`
  - borderBend - bends the normals of the border in the direction of the border - default is `0.5`

- **makeFadeMaterial** - _fades the opacity by mapping the z-position of the geometry from -0.5 to 0.5 on the z-axis_

- **makeHighlightMaterial** - _displays a highlight effect based on the distance of up to 2 world positions_
  - position1 - `Vector3` - position of the first highlighting element - default is `(Infinity, Infinity, Infinity)`
  - position2 - `Vector3` - position of the second highlighting element - default is `(Infinity, Infinity, Infinity)`
  - highlightOpacity - `number` - opacity of the highlight - default is `1`
  - highlightDistance - `number` - distance at which the highlight should start to appear - default is `1`
  - highlightColor - `Vector3` - color of the highlight - default is `(1, 1, 1)`
