import "../style.css";
import { bedroomItems, sections, type BedroomItem } from "./content";

type Direction = "up" | "down" | "left" | "right";

interface PlayerState {
  x: number;
  y: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number;
  dir: Direction;
  step: number;
}

const tile = 16;
const viewWidth = 240;
const viewHeight = 160;
const roomCols = 15;
const roomRows = 10;
const wallRows = 2;
const stepDuration = 135;

const directionVectors: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const solidItemKinds = new Set<BedroomItem["kind"]>([
  "computer",
  "bass",
  "tv",
  "bed",
  "server",
  "camera",
  "shelf",
  "mail",
  "plant"
]);

const roomCanvas = mustGet<HTMLCanvasElement>("room-canvas");
const bedroomItemsRoot = mustGet<HTMLElement>("bedroom-items");
const roomContext = roomCanvas.getContext("2d");

if (!roomContext) {
  throw new Error("Could not create bedroom canvas context");
}

const ctx: CanvasRenderingContext2D = roomContext;
ctx.imageSmoothingEnabled = false;

const player: PlayerState = {
  x: 7,
  y: 7,
  fromX: 7,
  fromY: 7,
  toX: 7,
  toY: 7,
  progress: 1,
  dir: "down",
  step: 0
};

let lastFrameTime = performance.now();
let activeItem: BedroomItem | null = null;
let hoveredItem: BedroomItem | null = null;
let heldDirections: Direction[] = [];
let lastNearbyItem: BedroomItem | null = null;

renderAccessibleObjectButtons();
wireInput();
requestAnimationFrame(tick);

function mustGet<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing required element: #${id}`);
  }
  return element as T;
}

function renderAccessibleObjectButtons(): void {
  bedroomItemsRoot.innerHTML = bedroomItems
    .map(
      (item) => `
        <button type="button" data-bedroom-item="${item.id}">
          ${escapeHtml(item.label)}
        </button>
      `
    )
    .join("");

  bedroomItemsRoot.querySelectorAll<HTMLButtonElement>("[data-bedroom-item]").forEach((button) => {
    const item = bedroomItems.find((candidate) => candidate.id === button.dataset.bedroomItem);
    if (item) {
      button.addEventListener("click", () => inspectItem(item));
    }
  });
}

function wireInput(): void {
  roomCanvas.addEventListener("pointermove", handlePointerMove);
  roomCanvas.addEventListener("pointerleave", () => {
    hoveredItem = null;
  });
  roomCanvas.addEventListener("pointerdown", (event) => {
    roomCanvas.focus();
    const item = getCanvasItem(event);
    if (item) {
      inspectItem(item);
      return;
    }
    faceClickedTile(event);
  });

  window.addEventListener("keydown", (event) => {
    const direction = keyToDirection(event.key);
    if (direction) {
      event.preventDefault();
      activeItem = null;
      heldDirections = [...heldDirections.filter((held) => held !== direction), direction];
      if (player.progress >= 1) {
        attemptMove(direction);
      }
      return;
    }

    if (event.key === "z" || event.key === "Z" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inspectFacingItem();
    }
  });

  window.addEventListener("keyup", (event) => {
    const direction = keyToDirection(event.key);
    if (direction) {
      heldDirections = heldDirections.filter((held) => held !== direction);
    }
  });
}

function keyToDirection(key: string): Direction | null {
  switch (key) {
    case "ArrowUp":
    case "w":
    case "W":
      return "up";
    case "ArrowDown":
    case "s":
    case "S":
      return "down";
    case "ArrowLeft":
    case "a":
    case "A":
      return "left";
    case "ArrowRight":
    case "d":
    case "D":
      return "right";
    default:
      return null;
  }
}

function tick(time: number): void {
  const delta = Math.min(48, time - lastFrameTime);
  lastFrameTime = time;
  update(delta);
  draw();
  requestAnimationFrame(tick);
}

function update(delta: number): void {
  if (player.progress < 1) {
    player.progress = Math.min(1, player.progress + delta / stepDuration);
    if (player.progress >= 1) {
      player.x = player.toX;
      player.y = player.toY;
    }
    return;
  }

  const direction = heldDirections[heldDirections.length - 1];
  if (!direction) {
    return;
  }

  attemptMove(direction);
}

function attemptMove(direction: Direction): void {
  const vector = directionVectors[direction];
  const nextX = player.x + vector.x;
  const nextY = player.y + vector.y;
  player.dir = direction;

  if (isSolidTile(nextX, nextY)) {
    return;
  }

  player.fromX = player.x;
  player.fromY = player.y;
  player.toX = nextX;
  player.toY = nextY;
  player.progress = 0;
  player.step = (player.step + 1) % 4;
}

function inspectFacingItem(): void {
  const item = getFacingItem();
  if (item) {
    inspectItem(item);
    return;
  }

  activeItem = {
    id: "empty-space",
    section: "home",
    kind: "notebook",
    label: "Room",
    command: "home",
    inspect: "Nothing unusual here. The room still feels carefully arranged, though.",
    x: player.x,
    y: player.y,
    w: 1,
    h: 1,
    accent: sections.home.accent
  };
}

function inspectItem(item: BedroomItem): void {
  activeItem = item;
  const section = sections[item.section];
  const hash = `#${section.id}`;
  if (window.location.hash !== hash) {
    history.replaceState(null, "", hash);
  }
}

function getFacingItem(): BedroomItem | null {
  const vector = directionVectors[player.dir];
  const facingX = player.x + vector.x;
  const facingY = player.y + vector.y;

  return (
    [...bedroomItems]
      .reverse()
      .find((item) => {
        if (tileInsideItem(item, facingX, facingY)) {
          return true;
        }

        const box = itemBox(item);
        const playerCenterX = player.x * tile + tile / 2;
        const playerCenterY = player.y * tile + tile / 2;
        const closestX = clamp(playerCenterX, box.x, box.x + box.w);
        const closestY = clamp(playerCenterY, box.y, box.y + box.h);
        const distance = Math.hypot(playerCenterX - closestX, playerCenterY - closestY);
        return distance <= 20 && facesItem(item);
      }) ?? null
  );
}

function facesItem(item: BedroomItem): boolean {
  const box = itemBox(item);
  const playerX = player.x * tile + tile / 2;
  const playerY = player.y * tile + tile / 2;

  switch (player.dir) {
    case "up":
      return playerY >= box.y + box.h - 2;
    case "down":
      return playerY <= box.y + 2;
    case "left":
      return playerX >= box.x + box.w - 2;
    case "right":
      return playerX <= box.x + 2;
  }
}

function isSolidTile(x: number, y: number): boolean {
  if (x < 0 || x >= roomCols || y < wallRows + 1 || y >= roomRows) {
    return true;
  }

  return bedroomItems.some((item) => {
    if (!solidItemKinds.has(item.kind)) {
      return false;
    }
    return tileInsideItem(item, x, y);
  });
}

function tileInsideItem(item: BedroomItem, x: number, y: number): boolean {
  return x >= item.x && x < item.x + item.w && y >= item.y && y < item.y + item.h;
}

function handlePointerMove(event: PointerEvent): void {
  const item = getCanvasItem(event);
  roomCanvas.style.cursor = item ? "pointer" : "default";
  hoveredItem = item;
}

function faceClickedTile(event: PointerEvent): void {
  const point = getCanvasPoint(event);
  const tileX = Math.floor(point.x / tile);
  const tileY = Math.floor(point.y / tile);
  const dx = tileX - player.x;
  const dy = tileY - player.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    player.dir = dx < 0 ? "left" : "right";
  } else if (dy !== 0) {
    player.dir = dy < 0 ? "up" : "down";
  }
}

function getCanvasItem(event: PointerEvent): BedroomItem | null {
  const point = getCanvasPoint(event);
  return (
    [...bedroomItems]
      .reverse()
      .find((item) => {
        const box = itemBox(item);
        return point.x >= box.x && point.x <= box.x + box.w && point.y >= box.y && point.y <= box.y + box.h;
      }) ?? null
  );
}

function getCanvasPoint(event: PointerEvent): { x: number; y: number } {
  const rect = roomCanvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * viewWidth,
    y: ((event.clientY - rect.top) / rect.height) * viewHeight
  };
}

function draw(): void {
  ctx.clearRect(0, 0, viewWidth, viewHeight);
  drawRoomShell();
  drawRug();
  drawFloorClutter();

  const drawables = [...bedroomItems].sort((a, b) => a.y + a.h - (b.y + b.h));
  drawables.forEach((item) => {
    drawBedroomItem(item);
  });

  const nearbyItem = hoveredItem ?? getFacingItem();
  lastNearbyItem = nearbyItem;
  if (nearbyItem) {
    drawHotspotFrame(nearbyItem);
  }

  drawPlayer();
  drawInteractionHint();
  drawDialogue();
}

function drawRoomShell(): void {
  px(0, 0, viewWidth, viewHeight, "#101010");
  px(0, 0, viewWidth, 32, "#d8d5aa");
  px(0, 0, viewWidth, 2, "#6e747a");
  px(0, 17, viewWidth, 2, "#7ba3ce");
  px(0, 20, viewWidth, 6, "#b6d1e9");
  px(0, 26, viewWidth, 2, "#5d6d86");
  px(0, 30, viewWidth, 3, "#64616a");

  for (let y = 32; y < viewHeight; y += tile) {
    for (let x = 0; x < viewWidth; x += tile) {
      drawFloorTile(x, y, ((x + y) / tile) % 2 === 0);
    }
  }
}

function drawFloorTile(x: number, y: number, flipped: boolean): void {
  px(x, y, tile, tile, "#bba43a");
  px(x, y, tile, 1, "#d6c257");
  px(x, y, 1, tile, "#d6c257");
  px(x + tile - 1, y, 1, tile, "#8b782c");
  px(x, y + tile - 1, tile, 1, "#8b782c");

  if (flipped) {
    px(x + 3, y + 4, 10, 1, "#927e2d");
    px(x + 3, y + 7, 2, 7, "#927e2d");
    px(x + 8, y + 10, 5, 1, "#d0bb4f");
  } else {
    px(x + 4, y + 3, 1, 10, "#927e2d");
    px(x + 7, y + 3, 7, 2, "#927e2d");
    px(x + 10, y + 8, 1, 5, "#d0bb4f");
  }

  px(x + 15, y + 15, 3, 3, "#77756c");
}

function drawRug(): void {
  outline(72, 68, 72, 52, "#e6f0da");
  px(76, 72, 64, 44, "#6fcf79");
  px(80, 76, 56, 36, "#7bdc82");

  for (let y = 82; y < 109; y += 10) {
    for (let x = 86; x < 132; x += 12) {
      px(x, y, 3, 3, "#e8d56d");
    }
  }
}

function drawFloorClutter(): void {
  px(47, 130, 6, 3, "#5d6071");
  px(50, 126, 2, 4, "#4a4e5d");
  px(154, 73, 8, 4, "#775b36");
  px(156, 70, 4, 3, "#d9c978");
  px(34, 56, 5, 2, "#f0f3ef");
  px(38, 57, 5, 2, "#78aee2");
  px(188, 88, 5, 5, "#f28f82");
  px(194, 91, 4, 3, "#e8cf6a");
}

function drawBedroomItem(item: BedroomItem): void {
  const box = itemBox(item);

  switch (item.kind) {
    case "computer":
      drawComputer(box.x, box.y, box.w, box.h);
      break;
    case "bass":
      drawBass(box.x, box.y, box.w, box.h);
      break;
    case "tv":
      drawTvConsole(box.x, box.y, box.w, box.h);
      break;
    case "bed":
      drawBed(box.x, box.y, box.w, box.h);
      break;
    case "server":
      drawServer(box.x, box.y, box.w, box.h);
      break;
    case "notebook":
      drawNotebook(box.x, box.y, box.w, box.h);
      break;
    case "camera":
      drawCameraShelf(box.x, box.y, box.w, box.h);
      break;
    case "whiteboard":
      drawNowBoard(box.x, box.y, box.w, box.h);
      break;
    case "shelf":
      drawGearShelf(box.x, box.y, box.w, box.h);
      break;
    case "mail":
      drawMailCrate(box.x, box.y, box.w, box.h);
      break;
    case "poster":
      drawProjectPosters(box.x, box.y, box.w, box.h);
      break;
    case "plant":
      drawAiPlant(box.x, box.y, box.w, box.h);
      break;
  }
}

function drawComputer(x: number, y: number, w: number, h: number): void {
  drawDesk(x + 1, y + 28, w - 2, 13);
  outline(x + 4, y + 8, 18, 20, "#ecefe9");
  px(x + 7, y + 12, 12, 8, "#202438");
  px(x + 7, y + 21, 12, 3, "#6f7780");
  outline(x + 28, y + 5, 12, 22, "#dfe4df");
  px(x + 31, y + 10, 6, 7, "#5d6371");
  px(x + 30, y + 20, 8, 3, "#343a42");
  px(x + 12, y + 33, 21, 3, "#4c5260");
  px(x + 35, y + 32, 4, 6, "#6ed7d8");
}

function drawBass(x: number, y: number, _w: number, h: number): void {
  px(x + 7, y + 4, 2, h - 13, "#553725");
  px(x + 6, y + 3, 5, 3, "#9a693d");
  px(x + 8, y + 7, 1, h - 17, "#eedf99");
  px(x + 3, y + h - 19, 11, 13, "#5a3a2f");
  px(x + 2, y + h - 17, 13, 9, "#d59138");
  px(x + 5, y + h - 15, 8, 6, "#f0bd55");
  px(x + 7, y + h - 16, 3, 7, "#543a3c");
  px(x + 3, y + h - 3, 11, 2, "#4a4e5c");
}

function drawTvConsole(x: number, y: number, w: number, h: number): void {
  outline(x + 5, y, 34, 22, "#f6f1df");
  px(x + 10, y + 5, 24, 12, "#2a344d");
  px(x + 12, y + 7, 20, 8, "#7fa8e9");
  px(x + 13, y + 13, 18, 2, "#4b548a");
  drawDesk(x + 1, y + 22, w - 2, h - 21);
  px(x + 11, y + 27, 15, 5, "#3d4450");
  px(x + 14, y + 29, 9, 1, "#1f2430");
  px(x + 31, y + 28, 9, 3, "#a991f2");
}

function drawBed(x: number, y: number, w: number, h: number): void {
  outline(x, y, w, h - 3, "#6c7482");
  px(x + 4, y + 4, w - 8, h - 11, "#f7f6f0");
  px(x + 9, y + 7, w - 18, 9, "#fbfbf8");
  px(x + 5, y + 21, w - 10, h - 31, "#94e8ad");
  px(x + 9, y + 24, w - 18, 5, "#dcfae8");
  px(x + 5, y + h - 12, w - 10, 5, "#d5f6e2");
  px(x + 2, y + h - 5, w - 4, 3, "#4b5565");
  outline(x + w - 10, y + 18, 11, 14, "#896a3e");
  px(x + w - 7, y + 22, 5, 4, "#e7d36f");
}

function drawServer(x: number, y: number, w: number, h: number): void {
  outline(x + 1, y + 1, w - 2, h - 3, "#71b883");
  px(x + 4, y + 4, w - 8, 10, "#9df0ad");

  for (let row = 0; row < 3; row += 1) {
    const rowY = y + 18 + row * 8;
    px(x + 4, rowY, w - 8, 5, "#59636b");
    px(x + 6, rowY + 2, 3, 2, row === 0 ? "#e8cf6a" : "#6ed7d8");
    px(x + 11, rowY + 2, 3, 2, row === 1 ? "#f28f82" : "#d8d0bc");
    px(x + 17, rowY + 2, 7, 1, "#2c313a");
  }
}

function drawNotebook(x: number, y: number, w: number, h: number): void {
  outline(x + 2, y + 2, w - 4, h - 4, "#efe5c7");
  px(x + 5, y + 5, 10, h - 10, "#fff5d8");
  px(x + 16, y + 5, 11, h - 10, "#e4dac0");
  px(x + 15, y + 5, 1, h - 10, "#7b7481");
  px(x + 7, y + 8, 7, 1, "#a991f2");
  px(x + 18, y + 8, 6, 1, "#a991f2");
}

function drawCameraShelf(x: number, y: number, w: number, h: number): void {
  drawDesk(x + 1, y + h - 10, w - 2, 7);
  px(x + 7, y + 10, 16, 10, "#343642");
  px(x + 11, y + 7, 7, 4, "#343642");
  px(x + 20, y + 13, 7, 5, "#f27fa5");
  px(x + 22, y + 14, 3, 3, "#1f2230");
  px(x + 2, y + h - 16, 6, 5, "#d8c87b");
}

function drawNowBoard(x: number, y: number, w: number, h: number): void {
  outline(x + 1, y + 1, w - 2, h - 2, "#efeada");
  px(x + 4, y + 4, w - 8, h - 8, "#f8f2d8");
  px(x + 6, y + 8, 5, 5, "#e8cf6a");
  px(x + 14, y + 9, 5, 4, "#6ed7d8");
  px(x + 22, y + 7, 5, 5, "#f27fa5");
  px(x + 7, y + 21, 15, 1, "#747887");
}

function drawGearShelf(x: number, y: number, w: number, h: number): void {
  drawDesk(x, y + 2, w, 7);
  drawDesk(x, y + h - 9, w, 7);
  outline(x + 4, y + 11, 9, 9, "#6ed7d8");
  outline(x + 17, y + 10, 9, 10, "#f28f82");
  outline(x + 31, y + 12, 8, 8, "#87c779");
}

function drawMailCrate(x: number, y: number, w: number, h: number): void {
  outline(x + 2, y + 5, w - 4, h - 7, "#8d6a3c");
  px(x + 4, y + 2, w - 8, 7, "#fff0ce");
  px(x + 5, y + 6, w - 10, 2, "#ff9d70");
  px(x + 3, y + 11, w - 6, 2, "#5e4930");
}

function drawProjectPosters(x: number, y: number, _w: number, _h: number): void {
  outline(x + 1, y + 1, 11, 18, "#6ed7d8");
  px(x + 4, y + 5, 5, 9, "#aaf3f1");
  px(x + 14, y + 4, 12, 16, "#f27fa5");
  px(x + 18, y + 8, 5, 7, "#ffd2df");
  outline(x + 8, y + 20, 14, 10, "#e8cf6a");
  px(x + 12, y + 24, 7, 2, "#9a7e32");
}

function drawAiPlant(x: number, y: number, w: number, h: number): void {
  px(x + 4, y + 20, w - 8, 7, "#8b7a65");
  px(x + 6, y + 22, w - 12, 4, "#d2c59b");
  px(x + 2, y + 11, 7, 7, "#94e2a5");
  px(x + 8, y + 6, 7, 8, "#94e2a5");
  px(x + 11, y + 13, 7, 7, "#66b878");
  px(x + 7, y + 16, 2, 7, "#5f7a4b");
  px(x + 10, y + 4, 4, 4, "#6ed7d8");
  px(x + 11, y + 1, 1, 8, "#6ed7d8");
  px(x + 8, y + 6, 8, 1, "#6ed7d8");
}

function drawDesk(x: number, y: number, w: number, h: number): void {
  outline(x, y, w, h, "#bfaa45");
  px(x + 3, y + 2, w - 6, h - 5, "#d1bd4d");
  px(x + 4, y + h - 2, 3, 6, "#6f6b60");
  px(x + w - 7, y + h - 2, 3, 6, "#6f6b60");
}

function drawPlayer(): void {
  const eased = easeInOut(player.progress);
  const tileX = lerp(player.fromX, player.toX, eased);
  const tileY = lerp(player.fromY, player.toY, eased);
  const x = Math.round(tileX * tile);
  const y = Math.round(tileY * tile - 9);
  const walkOffset = player.progress < 1 && player.step % 2 === 0 ? 1 : 0;

  px(x + 4, y + 21, 8, 2, "rgba(0, 0, 0, 0.28)");
  px(x + 6, y + 5, 6, 5, "#efc49c");
  px(x + 4, y + 1, 10, 4, "#f0f3ef");
  px(x + 3, y + 5, 12, 3, "#c95768");
  px(x + 5, y + 10, 8, 6, "#36374d");
  px(x + 4, y + 15, 10, 6, "#df8952");

  if (player.dir === "up") {
    px(x + 5, y + 7, 8, 3, "#75605a");
    px(x + 5, y + 10, 8, 5, "#36374d");
  } else if (player.dir === "left") {
    px(x + 4, y + 8, 3, 2, "#15172a");
    px(x + 2, y + 11, 4, 5, "#36374d");
  } else if (player.dir === "right") {
    px(x + 11, y + 8, 3, 2, "#15172a");
    px(x + 12, y + 11, 4, 5, "#36374d");
  } else {
    px(x + 5, y + 8, 2, 1, "#15172a");
    px(x + 11, y + 8, 2, 1, "#15172a");
  }

  px(x + 5, y + 21, 3, 5 + walkOffset, "#28365c");
  px(x + 10, y + 21, 3, 5 - walkOffset, "#28365c");
  px(x + 4, y + 26 + walkOffset, 5, 2, "#15172a");
  px(x + 9, y + 26 - walkOffset, 5, 2, "#15172a");
}

function drawInteractionHint(): void {
  if (activeItem) {
    return;
  }

  const hint = lastNearbyItem ? "Z / ENTER: INSPECT" : "ARROWS / WASD: MOVE";
  const width = textPixelWidth(hint) + 8;
  px(4, viewHeight - 13, width, 9, "#f8f1db");
  px(4, viewHeight - 13, width, 1, "#30333d");
  px(4, viewHeight - 5, width, 1, "#30333d");
  px(4, viewHeight - 13, 1, 9, "#30333d");
  px(3 + width, viewHeight - 13, 1, 9, "#30333d");
  drawPixelText(hint, 8, viewHeight - 11, "#30333d");
}

function drawDialogue(): void {
  if (!activeItem) {
    return;
  }

  const section = sections[activeItem.section];
  const title = activeItem.id === "empty-space" ? activeItem.label : `${activeItem.label}`;
  const message = `${title}: ${activeItem.inspect} ${section.highlights[0]}`;
  const lines = wrapText(message, 34).slice(0, 4);
  const y = 111;

  px(5, y, viewWidth - 10, 44, "#30333d");
  px(7, y + 2, viewWidth - 14, 40, "#f8f1db");
  px(9, y + 4, viewWidth - 18, 36, "#fffaf0");
  px(10, y + 5, 4, 4, activeItem.accent);

  lines.forEach((line, index) => {
    drawPixelText(line, 16, y + 8 + index * 8, "#30333d");
  });

  px(viewWidth - 17, y + 34, 7, 4, "#30333d");
  px(viewWidth - 15, y + 38, 3, 2, "#30333d");
}

function drawHotspotFrame(item: BedroomItem): void {
  const box = itemBox(item);
  const color = item.accent;
  px(box.x - 1, box.y - 1, 6, 1, color);
  px(box.x - 1, box.y - 1, 1, 6, color);
  px(box.x + box.w - 5, box.y - 1, 6, 1, color);
  px(box.x + box.w, box.y - 1, 1, 6, color);
  px(box.x - 1, box.y + box.h, 6, 1, color);
  px(box.x - 1, box.y + box.h - 5, 1, 6, color);
  px(box.x + box.w - 5, box.y + box.h, 6, 1, color);
  px(box.x + box.w, box.y + box.h - 5, 1, 6, color);
}

function itemBox(item: BedroomItem): { x: number; y: number; w: number; h: number } {
  return {
    x: item.x * tile,
    y: item.y * tile,
    w: item.w * tile,
    h: item.h * tile
  };
}

function outline(x: number, y: number, w: number, h: number, fill: string): void {
  px(x, y, w, h, "#59616d");
  px(x + 1, y + 1, w - 2, h - 2, fill);
  px(x + w - 2, y + 1, 1, h - 2, "#353a45");
  px(x + 1, y + h - 2, w - 2, 1, "#353a45");
  px(x + 2, y + 2, w - 4, 1, "rgba(255, 255, 255, 0.32)");
}

function px(x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function wrapText(value: string, maxChars: number): string[] {
  const words = value
    .toUpperCase()
    .replaceAll("'", "")
    .replaceAll(":", ":")
    .split(/\s+/);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
      return;
    }
    current = next;
  });

  if (current) {
    lines.push(current);
  }

  return lines;
}

function drawPixelText(text: string, x: number, y: number, color: string): void {
  let cursor = x;
  for (const character of text.toUpperCase()) {
    const glyph = font[character] ?? font["?"];
    glyph.forEach((row, rowIndex) => {
      for (let col = 0; col < row.length; col += 1) {
        if (row[col] === "1") {
          px(cursor + col, y + rowIndex, 1, 1, color);
        }
      }
    });
    cursor += 6;
  }
}

function textPixelWidth(text: string): number {
  return Math.max(0, text.length * 6 - 1);
}

function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}

function easeInOut(amount: number): number {
  return amount < 0.5 ? 2 * amount * amount : 1 - Math.pow(-2 * amount + 2, 2) / 2;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const font: Record<string, string[]> = {
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  "6": ["00111", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "11100"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "00000", "01100", "01000"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  "?": ["01110", "10001", "00001", "00010", "00100", "00000", "00100"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
  ";": ["00000", "01100", "01100", "00000", "01100", "01000", "00000"],
  "-": ["00000", "00000", "00000", "11110", "00000", "00000", "00000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"]
};
