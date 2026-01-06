import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import PhaserWrapper from "../game/PhaserWrapper";
import styles from "./CaroPage.module.css";
import { BACKEND } from "../config/constant";

type User = {
    id: number;
    name: string;
    wins: number;
    eliminated: boolean;
};

type Match = {
    id: number;
    player1: number;
    player2: number;
    status: string; //"ONGOING" | "COMPLETED"
};

const users: User[] = [
    { id: 1, name: "Alice", wins: 12, eliminated: false },
    { id: 2, name: "Bob", wins: 9, eliminated: false },
    { id: 3, name: "Charlie", wins: 3, eliminated: false },
    { id: 4, name: "David", wins: 3, eliminated: true },
];

const matches: Match[] = [
    { id: 1, player1: 1, player2: 2, status: "COMPLETED" },
    { id: 2, player1: 3, player2: 4, status: "ONGOING" },
];

export default function CaroPage() {
    const { tourId } = useParams();
    const phaserRef = useRef<any>(null);
    const [data, setData] = useState<any>(null);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [isMatching, setIsMatching] = useState(false);
    const toggleUserSelection = (userId: number, eliminated: boolean) => {
        if (eliminated) return;

        setSelectedUsers((prev) => {
            if (prev.includes(userId)) {
                return prev.filter((id) => id !== userId);
            }

            if (prev.length >= 2) {
                return prev; // không cho chọn quá 2
            }

            return [...prev, userId];
        });
    };

    const handleMatch = async () => {
        setIsMatching(true);

        const [user1, user2] = selectedUsers;

        try {
            const res = await fetch(`${BACKEND}/matches/1v1`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    problemCode: "tic-tac-toe-5",
                    submission1Id: user1,
                    submission2Id: user2,
                    tournamaentId: tourId,
                }),
            });

            if (!res.ok) {
                throw new Error("Match failed");
            }

            const result = await res.json();

            alert(
                `Match created successfully!\nMatch ID: ${result.id ?? "N/A"}`
            );
            if (result.id) {
                const res = await fetch(
                    `${BACKEND}/matches/${result.id}/start`,
                    {
                        method: "POST",
                    }
                );
                if (!res.ok) {
                    throw new Error("Start match failed");
                }
                alert(`Match started successfully!`);
            }

            // while (true) {
            //     const res = await fetch(`${BACKEND}/matches/${result.id}`);
            //     const statusData = await res.json();
            //     if (statusData.status !== "COMPLETED") {
            //         await new Promise((r) => setTimeout(r, 2000));
            //     } else break;
            // }
            setSelectedUsers([]);
        } catch (err) {
            alert("Failed to create match.");
        } finally {
            setIsMatching(false);
        }
    };

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
            style={{ display: "flex", height: "100vh", width: "100vw" }}
            className={styles.caroPage}
        >
            {/* UI LEFT */}
            <div
                style={{
                    width: 320,
                    padding: 16,
                    borderBottom: "1px solid #ccc",
                }}
                className={styles.caroSidebar}
            >
                <div>
                    <h2>Caro Game Tournament #{tourId}</h2>
                </div>
                <div className={styles.caroMatchInfo}>
                    <input type="file" accept=".json" onChange={loadFile} />
                    <p>Player 1: {data && data.p1}</p>
                    <p>Player 2: {data && data.p2}</p>
                    <p>Winner: {data && data.winner}</p>
                </div>
                <div className={styles.matchHistory}>
                    <h3>Match History</h3>
                    {matches.map((match) => (
                        <div key={match.id} className={styles.matchCard}>
                            <div className={styles.matchId}>#{match.id}</div>
                            <div className={styles.matchPlayers}>
                                Player {match.player1} vs Player {match.player2}
                            </div>
                            <div className={styles.matchStatus}>
                                {match.status}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* GAME MID */}
            <div className={styles.gameContainer}>
                <PhaserWrapper ref={phaserRef} />
            </div>

            {/* USER LIST RIGHT */}
            <div className={styles.caroUserList}>
                <h3 className={styles.userListTitle}>Ranking</h3>
                <button
                    className={styles.matchButton}
                    onClick={handleMatch}
                    disabled={isMatching || selectedUsers.length !== 2}
                >
                    {isMatching ? "Matching..." : "Match"}
                </button>

                <div className={styles.userList}>
                    {users.map((user, index) => (
                        <div
                            className={`${styles.userCard}
                            ${user.eliminated ? styles.eliminated : ""}
                            ${
                                selectedUsers.includes(user.id)
                                    ? styles.selected
                                    : ""
                            }
                        `}
                            onClick={() =>
                                toggleUserSelection(user.id, user.eliminated)
                            }
                        >
                            <div className={styles.userRank}>#{index + 1}</div>

                            <div className={styles.userInfo}>
                                <div className={styles.userName}>
                                    {user.name}
                                </div>
                                <div className={styles.userStats}>
                                    Wins: <span>{user.wins}</span>
                                </div>
                            </div>

                            {user.eliminated && (
                                <div className={styles.userStatus}>
                                    ELIMINATED
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
