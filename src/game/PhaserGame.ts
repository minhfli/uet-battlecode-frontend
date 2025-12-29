import Phaser from "phaser";
import CaroScene from "./scenes/CaroScene";

export default class PhaserGame {
    game: Phaser.Game;

    constructor(parent: HTMLDivElement) {
        parent.innerHTML = "";
        this.game = new Phaser.Game({
            type: Phaser.AUTO,
            parent,
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
            backgroundColor: "#f0f0f0",
            scene: [CaroScene],
        });
    }

    loadReplay(data: any) {
        const scene = this.game.scene.getScene("CaroScene") as any;
        scene.loadReplay(data);
    }

    destroy() {
        this.game.destroy(true);
    }
}
