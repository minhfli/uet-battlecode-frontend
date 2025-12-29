import { useRef, useState } from "react";
import PhaserWrapper from "../game/PhaserWrapper";
import styles from "./CaroPage.module.css";

export default function CaroPage() {
    const phaserRef = useRef<any>(null);
    const [data, setData] = useState<any>(null);

    const loadFile = (e: any) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            const json = JSON.parse(reader.result as string);
            setData(json);
            phaserRef.current?.loadReplay(json);
            console.log("File loaded", json);
        };
        reader.readAsText(file);
    };

    return (
        <div
            style={{ display: "flex", height: "100vh" }}
            className={styles.caroPage}
        >
            {/* UI LEFT */}
            <div
                style={{
                    width: 320,
                    padding: 16,
                    borderRight: "1px solid #ccc",
                }}
                className={styles.caroSidebar}
            >
                <input type="file" accept=".json" onChange={loadFile} />
                {data && (
                    <>
                        <p>Player 1: {data.p1}</p>
                        <p>Player 2: {data.p2}</p>
                        <p>Winner: {data.winner}</p>
                    </>
                )}
            </div>

            {/* GAME RIGHT */}
            <div
                style={{ flex: 1, position: "relative" }}
                className={styles.caroGame}
            >
                <div className={styles.gameContainer}>
                    <PhaserWrapper ref={phaserRef} />
                </div>
            </div>
        </div>
    );
}
