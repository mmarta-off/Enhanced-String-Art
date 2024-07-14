document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('stringArtCanvas');
    const ctx = canvas.getContext('2d');
    const pins = [];
    const lines = [];
    let currentLine = null;
    let hoverPin = null;

    canvas.width = 800;
    canvas.height = 600;

    const stringColorInput = document.getElementById('stringColor');
    const stringThicknessInput = document.getElementById('stringThickness');
    const clearCanvasButton = document.getElementById('clearCanvas');
    const undoActionButton = document.getElementById('undoAction');

    canvas.addEventListener('click', function(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        pins.push({ x, y });
        draw();
    });

    canvas.addEventListener('mousedown', function(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        currentLine = { startX: x, startY: y, color: stringColorInput.value, thickness: stringThicknessInput.value };
    });

    canvas.addEventListener('mousemove', function(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        hoverPin = getClosestPin(x, y);

        if (currentLine) {
            draw();
            if (hoverPin) {
                drawBezierCurve(currentLine.startX, currentLine.startY, hoverPin.x, hoverPin.y, currentLine.color, currentLine.thickness);
            } else {
                drawBezierCurve(currentLine.startX, currentLine.startY, x, y, currentLine.color, currentLine.thickness);
            }
        } else {
            draw();
        }
    });

    canvas.addEventListener('mouseup', function(e) {
        if (currentLine) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const endPin = getClosestPin(x, y);
            if (endPin) {
                lines.push({ ...currentLine, endX: endPin.x, endY: endPin.y });
            } else {
                lines.push({ ...currentLine, endX: x, endY: y });
            }
            currentLine = null;
            draw();
        }
    });

    clearCanvasButton.addEventListener('click', function() {
        pins.length = 0;
        lines.length = 0;
        draw();
    });

    undoActionButton.addEventListener('click', function() {
        if (lines.length > 0) {
            lines.pop();
            draw();
        }
    });

    function getClosestPin(x, y) {
        return pins.find(pin => Math.sqrt((pin.x - x) ** 2 + (pin.y - y) ** 2) < 10);
    }

    function drawPins() {
        pins.forEach(pin => {
            ctx.fillStyle = pin === hoverPin ? '#ff0000' : '#000';
            ctx.beginPath();
            ctx.arc(pin.x, pin.y, 5, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function drawBezierCurve(x1, y1, x2, y2, color, thickness) {
        const cp1x = x1 + (x2 - x1) / 3;
        const cp1y = y1;
        const cp2x = x1 + 2 * (x2 - x1) / 3;
        const cp2y = y2;
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
        ctx.stroke();
    }

    function drawLines() {
        lines.forEach(line => {
            drawBezierCurve(line.startX, line.startY, line.endX, line.endY, line.color, line.thickness);
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPins();
        drawLines();
    }
});
