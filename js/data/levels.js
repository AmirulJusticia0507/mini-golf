export const LEVELS = [
  {
    name: "Pine Bend", par: 3, start: { x: 145, y: 460 }, hole: { x: 808, y: 133, radius: 18 },
    obstacles: [
      { x: 330, y: 302, width: 175, height: 36, radius: 16 },
      { x: 618, y: 174, width: 38, height: 174, radius: 16 },
    ],
    sand: [{ x: 687, y: 395, rx: 105, ry: 55, rotation: -.18 }],
    trees: [{x:95,y:98},{x:156,y:106},{x:875,y:470},{x:829,y:504},{x:75,y:315}],
  },
  {
    name: "Mossy Gate", par: 4, start: { x: 116, y: 122 }, hole: { x: 825, y: 475, radius: 18 },
    obstacles: [
      { x: 255, y: 70, width: 38, height: 300, radius: 16 },
      { x: 480, y: 260, width: 240, height: 38, radius: 16 },
    ],
    sand: [{ x: 410, y: 460, rx: 115, ry: 58, rotation: .2 }],
    trees: [{x:70,y:510},{x:885,y:105},{x:850,y:75},{x:625,y:490}],
  },
  {
    name: "Final Turn", par: 4, start: { x: 120, y: 480 }, hole: { x: 838, y: 112, radius: 18 },
    obstacles: [
      { x: 238, y: 365, width: 370, height: 38, radius: 16 },
      { x: 580, y: 166, width: 38, height: 237, radius: 16 },
      { x: 745, y: 182, width: 145, height: 36, radius: 16 },
    ],
    sand: [{ x: 378, y: 175, rx: 108, ry: 56, rotation: -.25 }],
    trees: [{x:68,y:90},{x:100,y:116},{x:884,y:500},{x:760,y:495}],
  },
  {
    name: "Willow Bend", par: 3, start: { x: 120, y: 500 }, hole: { x: 840, y: 120, radius: 18 },
    obstacles: [
      { x: 300, y: 200, width: 200, height: 36, radius: 16 },
      { x: 600, y: 360, width: 38, height: 180, radius: 16 },
    ],
    sand: [{ x: 450, y: 420, rx: 110, ry: 50, rotation: .15 }, { x: 760, y: 260, rx: 70, ry: 40, rotation: -.3 }],
    trees: [{x:90,y:100},{x:160,y:95},{x:880,y:480},{x:830,y:510},{x:400,y:80}],
  },
  {
    name: "Sand Trap", par: 4, start: { x: 100, y: 120 }, hole: { x: 820, y: 480, radius: 18 },
    obstacles: [
      { x: 240, y: 260, width: 38, height: 220, radius: 16 },
      { x: 470, y: 150, width: 180, height: 38, radius: 16 },
      { x: 700, y: 320, width: 38, height: 160, radius: 16 },
    ],
    sand: [{ x: 360, y: 470, rx: 130, ry: 60, rotation: -.1 }],
    trees: [{x:75,y:500},{x:890,y:95},{x:860,y:120},{x:600,y:500}],
  },
];
