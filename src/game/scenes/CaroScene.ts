import Phaser from "phaser";

export default class CaroScene extends Phaser.Scene {
    boardSize = 15;
    cellSize = 64;
    moves: any[] = [];
    moveIndex = 0;
    defaultZoom = 1;
    moveDelay = 300;
    board: number[][] = []; // bảng trạng thái trò chơi
    // 1: player 1, 2: player 2, 0: empty
    // -1: blocked cell
    nearwinBoard: number[][] = []; // bảng trạng thái các ô gần thắng

    preload() {
        this.load.image("p1", "/assets/x.png");
        this.load.image("p2", "/assets/o.png");
    }
    constructor() {
        super("CaroScene");
    }

    create() {}

    loadReplay(data: any) {
        this.clearScene();

        this.boardSize = data.board_size;
        this.moves = data.moves;
        this.moveIndex = 0;
        this.board = Array.from({ length: this.boardSize }, () =>
            Array(this.boardSize).fill(0)
        );
        this.nearwinBoard = Array.from({ length: this.boardSize }, () =>
            Array(this.boardSize).fill(0)
        );

        this.drawGrid();

        this.time.addEvent({
            delay: this.moveDelay,
            repeat: this.moves.length - 1,
            callback: () => this.playNextMove(),
        });
        const cam = this.cameras.main;
        cam.centerOn(
            (this.boardSize * this.cellSize) / 2,
            (this.boardSize * this.cellSize) / 2
        );
        // set zoom to fit board
        const zoomX = cam.width / (this.boardSize * this.cellSize);
        const zoomY = cam.height / (this.boardSize * this.cellSize);
        const zoom = Math.min(zoomX, zoomY);
        cam.setZoom(zoom);
        this.defaultZoom = zoom;
    }

    clearScene() {
        this.children.removeAll();
    }

    drawGrid() {
        const g = this.add.graphics();
        g.lineStyle(1, 0x999999);

        const size = this.boardSize * this.cellSize;
        for (let i = 0; i <= this.boardSize; i++) {
            g.lineBetween(0, i * this.cellSize, size, i * this.cellSize);
            g.lineBetween(i * this.cellSize, 0, i * this.cellSize, size);
        }
    }

    playNextMove() {
        const move = this.moves[this.moveIndex++];
        if (!move) return;
        this.board[move.col][move.row] = move.player;
        this.placeSymbol(move.col, move.row, move.player);

        // Kiểm tra xem có thắng không
        const winDirections = this.findWinDirections(
            move.col,
            move.row,
            move.player
        );
        if (winDirections.length > 0) {
            // Có thắng, vẽ đường gạch
            this.drawWinLine(move.col, move.row, move.player);
        } else {
            // Chưa thắng, kiểm tra ô gần thắng
            this.checkNearWin(move.col, move.row, move.player);
        }
    }

    findWinDirections(
        x: number,
        y: number,
        player: number
    ): { dx: number; dy: number }[] {
        const directions = [
            { dx: 1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 1, dy: 1 },
            { dx: 1, dy: -1 },
        ];

        const winDirections = [];

        for (const dir of directions) {
            let count = 1;

            // Đếm về phía dương
            for (let step = 1; step <= 10; step++) {
                const nx = x + dir.dx * step;
                const ny = y + dir.dy * step;
                if (
                    nx < 0 ||
                    ny < 0 ||
                    nx >= this.boardSize ||
                    ny >= this.boardSize ||
                    this.board[nx][ny] !== player
                ) {
                    break;
                }
                count++;
            }

            // Đếm về phía âm
            for (let step = 1; step <= 10; step++) {
                const nx = x - dir.dx * step;
                const ny = y - dir.dy * step;
                if (
                    nx < 0 ||
                    ny < 0 ||
                    nx >= this.boardSize ||
                    ny >= this.boardSize ||
                    this.board[nx][ny] !== player
                ) {
                    break;
                }
                count++;
            }

            // Nếu có ít nhất 5 quân cờ liên tiếp thì thêm vào danh sách
            if (count >= 5) {
                winDirections.push(dir);
            }
        }

        return winDirections;
    }

    placeSymbol(x: number, y: number, player: number) {
        const key = player === 1 ? "p1" : "p2";

        const symbol = this.add.image(
            x * this.cellSize + this.cellSize / 2,
            y * this.cellSize + this.cellSize / 2,
            key
        );

        // scale ảnh vừa với ô
        const targetSize = this.cellSize * 0.8;
        const scale = targetSize / symbol.width;
        symbol.setScale(scale);

        // hiệu ứng khi đặt
        symbol.setTint(0xffffaa);
        this.time.delayedCall(150, () => symbol.clearTint());

        // animation khi xuất hiện
        symbol.setScale(0);
        this.tweens.add({
            targets: symbol,
            scale: 1,
            duration: 200,
            ease: "Back.Out",
        });
    }

    addNearWinHint(x: number, y: number) {
        const hint = this.add.rectangle(
            (x + 0.5) * this.cellSize,
            (y + 0.5) * this.cellSize,
            this.cellSize * 0.8,
            this.cellSize * 0.8,
            0xe0a000,
            0.5
        );
        hint.setStrokeStyle(2, 0x804000);
        hint.setScale(0);
        this.tweens.add({
            targets: hint,
            scale: 1,
            duration: 300,
            ease: "Back.Out",
        });
        // mờ dần và biến mất
        this.tweens.add({
            targets: hint,
            alpha: 0,
            duration: 3000,
            ease: "Cubic.Out",
        });
        this.time.delayedCall(3000, () => hint.destroy());
    }

    drawWinLine(x: number, y: number, player: number) {
        const winDirections = this.findWinDirections(x, y, player);

        for (const direction of winDirections) {
            let startX = x;
            let startY = y;

            // Tìm điểm bắt đầu
            for (let step = 1; step <= 10; step++) {
                const nx = x - direction.dx * step;
                const ny = y - direction.dy * step;
                if (
                    nx < 0 ||
                    ny < 0 ||
                    nx >= this.boardSize ||
                    ny >= this.boardSize ||
                    this.board[nx][ny] !== player
                ) {
                    break;
                }
                startX = nx;
                startY = ny;
            }

            // Tìm điểm cuối
            let endX = x;
            let endY = y;
            for (let step = 1; step <= 10; step++) {
                const nx = x + direction.dx * step;
                const ny = y + direction.dy * step;
                if (
                    nx < 0 ||
                    ny < 0 ||
                    nx >= this.boardSize ||
                    ny >= this.boardSize ||
                    this.board[nx][ny] !== player
                ) {
                    break;
                }
                endX = nx;
                endY = ny;
            }

            // Tính toán tọa độ pixel
            const x1 = startX * this.cellSize + this.cellSize / 2;
            const y1 = startY * this.cellSize + this.cellSize / 2;
            const x2 = endX * this.cellSize + this.cellSize / 2;
            const y2 = endY * this.cellSize + this.cellSize / 2;

            const color = 0x000000;

            // Tạo graphics object
            const graphics = this.add.graphics();

            const line = new Phaser.Geom.Line(x1, y1, x1, y1);

            this.tweens.add({
                targets: line,
                x2: x2,
                y2: y2,
                duration: 400,
                ease: "Linear",
                onUpdate: () => {
                    graphics.clear();
                    graphics.lineStyle(8, color, 1);
                    graphics.strokeLineShape(line);
                },
            });
        }

        // Hiển thị thông báo chiến thắng
        this.displayWinMessage(player);
    }

    displayWinMessage(player: number) {
        const playerName = player === 1 ? "Player 1" : "Player 2";
        const text = `${playerName} Wins!`;

        // Lấy tọa độ center của viewport
        const centerX = 300;
        const centerY = 100;

        // Tạo text background - căn ở giữa viewport
        const bg = this.add.rectangle(
            centerX,
            centerY,
            700,
            250,
            0x000000,
            0.1
        );
        bg.setOrigin(0.5);
        bg.setStrokeStyle(4, 0x000000);
        bg.setDepth(1000);

        // Tạo text chính - căn ở giữa viewport
        const message = this.add.text(centerX, centerY, text, {
            fontSize: "80px",
            color: player === 1 ? "#a53030" : "#4f8fba",
            align: "center",
            fontStyle: "bold",
            fontFamily: "Arial",
        });
        message.setOrigin(0.5, 0.5);
        message.setDepth(1001);
        // Animation xuất hiện
        bg.setScale(0);
        message.setScale(0);

        this.tweens.add({
            targets: [bg, message],
            scale: 1,
            duration: 500,
            ease: "Back.Out",
        });

        // Nhấp nháy text chính
        this.tweens.add({
            targets: message,
            alpha: 0.7,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: "Sine.InOut",
        });
    }

    checkNearWin(x: number, y: number, player: number) {
        // kiểm tra 4 hướng
        const directions = [
            { dx: 1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 1, dy: 1 },
            { dx: 1, dy: -1 },
        ];
        for (const dir of directions) {
            let currentCount = 1; // số quân cờ liên tiếp hiện tại
            let positiveCount = 0; // số quân cờ liên tiếp về phía dương, cách 1 ô trống
            let negativeCount = 0; // số quân cờ liên tiếp về phía âm, cách 1 ô trống
            let positiveEmptyCell = []; // ô trống về phía dương
            let negativeEmptyCell = []; // ô trống về phía âm
            // đếm về phía dương
            for (let step = 1; step <= 10; step++) {
                const nx = x + dir.dx * step;
                const ny = y + dir.dy * step;
                if (
                    nx < 0 ||
                    ny < 0 ||
                    nx >= this.boardSize ||
                    ny >= this.boardSize
                ) {
                    break;
                }
                if (this.board[nx][ny] === player) {
                    if (positiveEmptyCell.length == 0) currentCount++;
                    else positiveCount++;
                } else if (
                    this.board[nx][ny] === 0 &&
                    positiveEmptyCell.length < 1
                ) {
                    positiveEmptyCell.push({ x: nx, y: ny });
                } else {
                    break;
                }
            }
            // đếm về phía âm
            for (let step = 1; step <= 10; step++) {
                const nx = x - dir.dx * step;
                const ny = y - dir.dy * step;
                if (
                    nx < 0 ||
                    ny < 0 ||
                    nx >= this.boardSize ||
                    ny >= this.boardSize
                ) {
                    break;
                }
                if (this.board[nx][ny] === player) {
                    if (negativeEmptyCell.length == 0) currentCount++;
                    else negativeCount++;
                } else if (
                    this.board[nx][ny] === 0 &&
                    negativeEmptyCell.length < 1
                ) {
                    negativeEmptyCell.push({ x: nx, y: ny });
                } else {
                    break;
                }
            }
            // kiểm tra nếu gần thắng
            if (positiveEmptyCell.length + currentCount + positiveCount >= 5) {
                const x = positiveEmptyCell[0].x;
                const y = positiveEmptyCell[0].y;
                this.nearwinBoard[x][y] = player;
                // đánh dấu ô gần thắng
                this.addNearWinHint(x, y);
            }
            if (negativeEmptyCell.length + currentCount + negativeCount >= 5) {
                const x = negativeEmptyCell[0].x;
                const y = negativeEmptyCell[0].y;
                this.nearwinBoard[x][y] = player;
                // đánh dấu ô gần thắng
                this.addNearWinHint(x, y);
            }
        }
    }
}
