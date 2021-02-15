import runSocketDrawing from "./socket.js";
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

canvas.height = canvas.parentElement.clientHeight;
canvas.width = canvas.parentElement.clientWidth;

const socket = io();

const pencil = document.querySelector("#tool-pencil");
const eraser = document.querySelector("#tool-eraser");
const codeSegment = document.querySelector("#tool-code-segment");
const font = document.querySelector("#tool-font");
const shapes = document.querySelector("#tool-shapes");
const line = document.querySelector("#shape-line");
const rectangle = document.querySelector("#shape-rectangle");
const circle = document.querySelector("#shape-circle");
const triangle = document.querySelector("#shape-triangle");

const clearCanvas = document.querySelector("#clear-canvas");
const canvasBg = document.querySelector("#canvas-bg");

const brush_size_5 = document.querySelector(".px15");
const brush_size_15 = document.querySelector(".px25");
const brush_size_25 = document.querySelector(".px35");
const brush_size_35 = document.querySelector(".px45");
const brush_size_45 = document.querySelector(".px55");
const brush_size_custom = document.querySelector(".size-ip");
const add_size_btn = document.querySelector(".add-size");

canvas.style.backgroundColor = "white";

let xOffset = canvas.getBoundingClientRect().left;
let yOffset = canvas.getBoundingClientRect().top;

class UI {
  static change_brush_size(size) {
    if (size != "*") ctx.lineWidth = size;
    else ctx.lineWidth = brush_size_custom.value;
  }
  static getCanvasCoordinates(eX, eY) {
    const x = eX - xOffset;
    const y = eY - yOffset;
    return { x, y };
  }
  static clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  static changeCanvasBg() {
    canvas.style.backgroundColor = document.querySelector("#canvas-bg").value;
  }
  static takeSnapshot() {
    this.currentSnap = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  static setSnapshot() {
    ctx.putImageData(this.currentSnap, 0, 0);
  }
  static startPos(x, y, source) {
    this.painting = true;
    this.startMousePos = UI.getCanvasCoordinates(x, y);
    UI.takeSnapshot();

    if (source == "client") {
      socket.emit("mousedown", { x, y });
    }
  }
  static endPos(x, y, source) {
    this.painting = false;
    this.position = UI.getCanvasCoordinates(x, y);
    UI.draw(x, y, source);
    ctx.beginPath();

    if (source == "client") {
      socket.emit("mouseup", { x, y });
    }
  }

  static draw(eX, eY, source) {
    if (!this.painting) return;

    ctx.strokeStyle = document.querySelector("#tool-palette").value;

    if (pencil.checked) {
      UI.drawPencil(eX, eY, source);
    } else if (eraser.checked) {
      ctx.clearRect(
        e.clientX - xOffset,
        e.clientY - yOffset,
        ctx.lineWidth,
        ctx.lineWidth
      );
    } else if (shapes.checked) {
      if (line.checked) {
        UI.setSnapshot();

        let startPosition = this.startMousePos;

        let endPosition = { x: eX - xOffset, y: eY - yOffset };

        UI.drawLine(startPosition, endPosition);
      } else if (rectangle.checked) {
        UI.setSnapshot();
        let startPosition = this.startMousePos;

        let endPosition = { x: eX - xOffset, y: eY - yOffset };

        UI.drawRect(startPosition, endPosition);
      } else if (circle.checked) {
        UI.setSnapshot();
        let startPosition = this.startMousePos;

        let endPosition = { x: eX - xOffset, y: eY - yOffset };

        UI.drawCircle(startPosition, endPosition);
      } else if (triangle.checked) {
        UI.setSnapshot();
        let startPosition = this.startMousePos;

        let endPosition = { x: eX - xOffset, y: eY - yOffset };

        UI.drawTriangle(startPosition, endPosition);
      }
    }
  }

  static drawLine(startPosition, endPosition) {
    ctx.beginPath();
    ctx.moveTo(startPosition.x, startPosition.y);
    ctx.lineTo(endPosition.x, endPosition.y);
    ctx.stroke();
  }
  static drawPencil(x, y, source) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    let final_x = x - xOffset;
    let final_y = y - yOffset;
    ctx.lineTo(final_x, final_y);
    ctx.stroke();
    if (source == "client") {
      socket.emit("pencilDraw", { x, y });
    }
  }
  static drawRect(startPosition, endPosition) {
    ctx.beginPath();
    ctx.rect(
      startPosition.x,
      startPosition.y,
      endPosition.x - startPosition.x,
      endPosition.y - startPosition.y
    );
    ctx.stroke();
  }
  static drawCircle(startPosition, endPosition) {
    ctx.beginPath();
    let xSq =
      (startPosition.x - endPosition.x) * (startPosition.x - endPosition.x);
    let ySq =
      (startPosition.y - endPosition.y) * (startPosition.y - endPosition.y);
    let distance = Math.sqrt(xSq + ySq);
    ctx.arc(startPosition.x, startPosition.y, distance, 0, 2 * Math.PI, false);
    ctx.stroke();
  }
  static drawTriangle(startPosition, endPosition) {
    ctx.beginPath();
    ctx.moveTo(
      startPosition.x + (endPosition.x - startPosition.x) / 2,
      startPosition.y
    );
    ctx.lineTo(startPosition.x, endPosition.y);
    ctx.lineTo(endPosition.x, endPosition.y);
    ctx.closePath();

    ctx.stroke();
  }
}

canvas.addEventListener("mousemove", (e) => {
  let x = e.clientX;
  let y = e.clientY;
  UI.draw(x, y, "client");
});
canvas.addEventListener("mousedown", (e) => {
  let x = e.clientX;
  let y = e.clientY;
  UI.startPos(x, y, "client");
});
canvas.addEventListener("mouseup", (e) => {
  let x = e.clientX;
  let y = e.clientY;
  UI.endPos(x, y, "client");
});

class TextArea {
  constructor() {
    this.resize = false;
  }

  mouseDownDrag(e, el) {
    console.log(this.resize);
    this.resize = !this.resize;
    console.log(this.resize);

    console.log("Drag");
    let selectedSide = e.target;
    let textBoxBound = el;

    let prevX = e.clientX;
    let prevY = e.clientY;

    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseup", mouseUp);
    let resizeStatus = this.resize;

    function mouseMove(e) {
      console.log(this.resize);
      if (!resizeStatus) {
        let newX = e.clientX;
        let newY = e.clientY;
        const rect = textBoxBound.getBoundingClientRect();

        textBoxBound.style.left = rect.left - (prevX - newX) + "px";
        textBoxBound.style.top = rect.top - (prevY - newY) + "px";

        prevX = newX;
        prevY = newY;
      }
    }

    function mouseUp() {
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseup", mouseUp);
    }
    return 0;
  }

  mouseDownResize(e) {
    this.resize = false;
    console.log("Resize");

    let selectedSide = e.target;
    let textBoxBound = e.target.parentElement;

    let prevX = e.clientX;
    let prevY = e.clientY;

    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseup", mouseUp);

    function mouseMove(e) {
      let newX = e.clientX;
      let newY = e.clientY;

      const rect = textBoxBound.getBoundingClientRect();
      if (selectedSide.classList.contains("bottom-right")) {
        textBoxBound.style.width = rect.width - (prevX - newX) + "px";
        textBoxBound.style.height = rect.height - (prevY - newY) + "px";
      } else if (selectedSide.classList.contains("bottom-left")) {
        textBoxBound.style.width = rect.width + (prevX - newX) + "px";
        textBoxBound.style.height = rect.height - (prevY - newY) + "px";
        textBoxBound.style.left = rect.left - (prevX - newX) + "px";
      } else if (selectedSide.classList.contains("top-right")) {
        textBoxBound.style.width = rect.width - (prevX - newX) + "px";
        textBoxBound.style.height = rect.height + (prevY - newY) + "px";
        textBoxBound.style.top = rect.top - (prevY - newY) + "px";
      } else if (selectedSide.classList.contains("top-left")) {
        textBoxBound.style.width = rect.width + (prevX - newX) + "px";
        textBoxBound.style.height = rect.height + (prevY - newY) + "px";
        textBoxBound.style.top = rect.top - (prevY - newY) + "px";
        textBoxBound.style.left = rect.left - (prevX - newX) + "px";
      } else if (selectedSide.classList.contains("left-side-center")) {
        textBoxBound.style.width = rect.width + (prevX - newX) + "px";
        textBoxBound.style.left = rect.left - (prevX - newX) + "px";
      } else if (selectedSide.classList.contains("right-side-center")) {
        textBoxBound.style.width = rect.width - (prevX - newX) + "px";
      } else if (selectedSide.classList.contains("top-center")) {
        textBoxBound.style.height = rect.height + (prevY - newY) + "px";
        textBoxBound.style.top = rect.top - (prevY - newY) + "px";
      } else if (selectedSide.classList.contains("bottom-center")) {
        textBoxBound.style.height = rect.height - (prevY - newY) + "px";
      }
      prevX = newX;
      prevY = newY;
    }

    function mouseUp() {
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseup", mouseUp);
    }
    return 0;
  }
  removeElement(element) {
    element.remove();
  }
}

class TextAreaTextBox extends TextArea {
  createTextArea(e) {
    this.textAreaDiv = document.createElement("div");
    this.textAreaDiv.classList.add("text-area-container");
    this.textarea = document.createElement("textarea");
    this.textarea.classList.add("textarea-textbox");
    this.textarea.rows = 30;
    this.textarea.cols = 30;

    this.removeBtn = document.createElement("span");
    this.removeBtn.classList.add("remove-btn-text-tool");
    // resizers
    this.topLeftResize = document.createElement("span");
    this.topLeftResize.classList.add(
      "resizer",
      "top-left",
      "cursor-diagonal-right"
    );

    this.topCenterResize = document.createElement("span");
    this.topCenterResize.classList.add(
      "resizer",
      "top-center",
      "cursor-horizontal"
    );

    this.topRightResize = document.createElement("span");
    this.topRightResize.classList.add(
      "resizer",
      "top-right",
      "cursor-diagonal-left"
    );

    this.leftSideCenterResize = document.createElement("span");
    this.leftSideCenterResize.classList.add(
      "resizer",
      "left-side-center",
      "cursor-vertical"
    );

    this.rightSideCenterResize = document.createElement("span");
    this.rightSideCenterResize.classList.add(
      "resizer",
      "right-side-center",
      "cursor-vertical"
    );

    this.bottomRightResize = document.createElement("span");
    this.bottomRightResize.classList.add(
      "resizer",
      "bottom-right",
      "cursor-diagonal-right"
    );

    this.bottomCenterResize = document.createElement("span");
    this.bottomCenterResize.classList.add(
      "resizer",
      "bottom-center",
      "cursor-horizontal"
    );

    this.bottomLeftResize = document.createElement("span");
    this.bottomLeftResize.classList.add(
      "resizer",
      "bottom-left",
      "cursor-diagonal-left"
    );

    this.textAreaDiv.appendChild(this.textarea);
    this.textAreaDiv.appendChild(this.removeBtn);
    this.textAreaDiv.appendChild(this.topLeftResize);
    this.textAreaDiv.appendChild(this.topCenterResize);
    this.textAreaDiv.appendChild(this.topRightResize);
    this.textAreaDiv.appendChild(this.leftSideCenterResize);
    this.textAreaDiv.appendChild(this.rightSideCenterResize);
    this.textAreaDiv.appendChild(this.bottomRightResize);
    this.textAreaDiv.appendChild(this.bottomCenterResize);
    this.textAreaDiv.appendChild(this.bottomLeftResize);

    this.textAreaDiv.style.left = "200px";
    this.textAreaDiv.style.top = "220px";

    document.body.appendChild(this.textAreaDiv);

    document.querySelectorAll(".text-area-container").forEach((textArea) => {
      textArea.addEventListener("mousedown", (e) => {
        this.mouseDownDrag(e, textArea);
      });
    });

    const resizers = document.querySelectorAll(".resizer");
    resizers.forEach((resizer) => {
      resizer.addEventListener("mousedown", (e) => {
        this.mouseDownResize(e);
      });
    });

    this.removeBtn.addEventListener("click", () => {
      this.removeElement(this.removeBtn.parentElement);
    });
  }
}

class CodeSegment extends TextArea {
  createTextArea(e) {
    this.codeSegmentContainer = document.createElement("div");
    this.codeSegmentContainer.classList.add("code-segment-container");

    this.codeSegmentHeader = document.createElement("div");
    this.codeSegmentHeader.classList.add("code-segment-header");

    this.codeSegmentHeaderButtons = document.createElement("div");
    this.codeSegmentHeaderButtons.classList.add("code-segment-buttons");

    this.codeSegmentBtn_red = document.createElement("span");
    this.codeSegmentBtn_red.classList.add(
      "code-segment-header-btn",
      "code-segment-red"
    );

    this.codeSegmentBtn_yellow = document.createElement("span");
    this.codeSegmentBtn_yellow.classList.add(
      "code-segment-header-btn",
      "code-segment-yellow"
    );

    this.codeSegmentBtn_green = document.createElement("span");
    this.codeSegmentBtn_green.classList.add(
      "code-segment-header-btn",
      "code-segment-green"
    );

    this.codeSegmentHeaderButtons.appendChild(this.codeSegmentBtn_red);
    this.codeSegmentHeaderButtons.appendChild(this.codeSegmentBtn_yellow);
    this.codeSegmentHeaderButtons.appendChild(this.codeSegmentBtn_green);

    this.codeSegmentHeader.appendChild(this.codeSegmentHeaderButtons);

    this.textarea = document.createElement("textarea");
    this.textarea.classList.add("code-segment-textarea");

    this.topLeftResize = document.createElement("span");
    this.topLeftResize.classList.add(
      "resizer",
      "top-left",
      "cursor-diagonal-right"
    );

    this.topCenterResize = document.createElement("span");
    this.topCenterResize.classList.add(
      "resizer",
      "top-center",
      "cursor-horizontal"
    );

    this.topRightResize = document.createElement("span");
    this.topRightResize.classList.add(
      "resizer",
      "top-right",
      "cursor-diagonal-left"
    );

    this.leftSideCenterResize = document.createElement("span");
    this.leftSideCenterResize.classList.add(
      "resizer",
      "left-side-center",
      "cursor-vertical"
    );

    this.rightSideCenterResize = document.createElement("span");
    this.rightSideCenterResize.classList.add(
      "resizer",
      "right-side-center",
      "cursor-vertical"
    );

    this.bottomRightResize = document.createElement("span");
    this.bottomRightResize.classList.add(
      "resizer",
      "bottom-right",
      "cursor-diagonal-right"
    );

    this.bottomCenterResize = document.createElement("span");
    this.bottomCenterResize.classList.add(
      "resizer",
      "bottom-center",
      "cursor-horizontal"
    );

    this.bottomLeftResize = document.createElement("span");
    this.bottomLeftResize.classList.add(
      "resizer",
      "bottom-left",
      "cursor-diagonal-left"
    );

    this.codeSegmentContainer.appendChild(this.codeSegmentHeader);
    this.codeSegmentContainer.appendChild(this.textarea);

    this.codeSegmentContainer.appendChild(this.topLeftResize);
    this.codeSegmentContainer.appendChild(this.topCenterResize);
    this.codeSegmentContainer.appendChild(this.topRightResize);
    this.codeSegmentContainer.appendChild(this.leftSideCenterResize);
    this.codeSegmentContainer.appendChild(this.rightSideCenterResize);
    this.codeSegmentContainer.appendChild(this.bottomRightResize);
    this.codeSegmentContainer.appendChild(this.bottomCenterResize);
    this.codeSegmentContainer.appendChild(this.bottomLeftResize);

    this.codeSegmentContainer.style.left = "200px";
    this.codeSegmentContainer.style.top = "220px";

    document.body.appendChild(this.codeSegmentContainer);

    document
      .querySelectorAll(".code-segment-container")
      .forEach((codeSegment) => {
        codeSegment.addEventListener("mousedown", (e) => {
          this.mouseDownDrag(e, codeSegment);
        });
      });

    const resizers = document.querySelectorAll(".resizer");
    resizers.forEach((resizer) => {
      resizer.addEventListener("mousedown", (e) => {
        this.mouseDownResize(e);
      });
    });

    this.codeSegmentBtn_red.addEventListener("click", () => {
      this.removeElement(
        this.codeSegmentBtn_red.parentElement.parentElement.parentElement
      );
    });
  }
}

clearCanvas.addEventListener("click", UI.clearCanvas);
canvasBg.addEventListener("change", UI.changeCanvasBg);
font.addEventListener("click", (e) => {
  const textAreaTextBox = new TextAreaTextBox();
  textAreaTextBox.createTextArea(e);
});
// font.addEventListener("click", () => console.log("Tool Font"));

codeSegment.addEventListener("click", (e) => {
  const codeSegment = new CodeSegment();
  codeSegment.createTextArea(e);
});

brush_size_5.addEventListener("click", () => {
  brush_size_5.classList.add("size-selected");
  brush_size_15.classList.remove("size-selected");
  brush_size_25.classList.remove("size-selected");
  brush_size_35.classList.remove("size-selected");
  brush_size_45.classList.remove("size-selected");
  UI.change_brush_size(5);
});
brush_size_15.addEventListener("click", () => {
  brush_size_15.classList.add("size-selected");
  brush_size_5.classList.remove("size-selected");
  brush_size_25.classList.remove("size-selected");
  brush_size_35.classList.remove("size-selected");
  brush_size_45.classList.remove("size-selected");
  UI.change_brush_size(15);
});
brush_size_25.addEventListener("click", () => {
  brush_size_25.classList.add("size-selected");
  brush_size_15.classList.remove("size-selected");
  brush_size_5.classList.remove("size-selected");
  brush_size_35.classList.remove("size-selected");
  brush_size_45.classList.remove("size-selected");
  UI.change_brush_size(25);
});
brush_size_35.addEventListener("click", () => {
  brush_size_35.classList.add("size-selected");
  brush_size_15.classList.remove("size-selected");
  brush_size_25.classList.remove("size-selected");
  brush_size_5.classList.remove("size-selected");
  brush_size_45.classList.remove("size-selected");
  UI.change_brush_size(35);
});
brush_size_45.addEventListener("click", () => {
  brush_size_45.classList.add("size-selected");
  brush_size_15.classList.remove("size-selected");
  brush_size_25.classList.remove("size-selected");
  brush_size_35.classList.remove("size-selected");
  brush_size_5.classList.remove("size-selected");
  UI.change_brush_size(55);
});
add_size_btn.addEventListener("click", () => {
  brush_size_5.classList.remove("size-selected");
  brush_size_15.classList.remove("size-selected");
  brush_size_25.classList.remove("size-selected");
  brush_size_35.classList.remove("size-selected");
  brush_size_45.classList.remove("size-selected");

  UI.change_brush_size("*");
});

//socket recieve

runSocketDrawing();

export { UI, socket };
