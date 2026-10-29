export const CONFIG = Object.freeze({
  width: 960,
  height: 600,
  margin: 34,
  ballRadius: 11,
  maxPull: 145,
  powerScale: 4.4,
  friction: 0.986,
  sandFriction: 0.955,
  stopSpeed: 6,
  captureSpeed: 95,
  restitution: 0.82,
  fixedStep: 1 / 120,
  maxFrame: 1 / 20,

  // 3D presentation only: the simulation stays 2D, these control the
  // fake-perspective projection and the look of the diorama.
  tilt: 32 * (Math.PI / 180),
  cameraDistance: 1600,
  extrusion: 26,
  ballHeight: 9,
});
