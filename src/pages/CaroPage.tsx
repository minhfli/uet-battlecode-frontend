import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import PhaserWrapper from "../game/PhaserWrapper";
import styles from "./CaroPage.module.css";
import { BACKEND } from "../config/constant";

type Submission = {
    codeUrl: string;
    submissionId: number;
    handle: string;
    language: number;
    problemCode: number;
};
type User = {
    active: boolean;
    email: string;
    handle: string;
};
type Match = {
    eventsUrl: string;
    matchId: number;
    problemCode: number;
    status: string; // FINISHED | PENDING
    tournamentId: number;
    winner: User;
};

export default function CaroPage() {
    const { tourId } = useParams();
    const phaserRef = useRef<any>(null);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [isMatching, setIsMatching] = useState(false);
    const [users, setUsers] = useState<Submission[]>([]); // submission is user here
    const [matchList, setMatchList] = useState<Match[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
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
                    tournamentId: parseInt(tourId || "0"),
                }),
            });

            if (!res.ok) {
                throw new Error("Match failed");
            }

            const result = await res.json();
            console.log("Match created:", result);
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
                const startData = await res.json();
                console.log("Match started:", startData);
                alert(`Match started successfully!`);
            }
            setSelectedUsers([]);
        } catch (err) {
            alert("Failed to create match.");
        } finally {
            setIsMatching(false);
        }
    };

    const handleStartReplay = async () => {
        // matches/id/replay
        if (selectedMatch) {
            const res = await fetch(
                `${BACKEND}/matches/${selectedMatch.matchId}/replay`,
                {
                    method: "GET",
                }
            );
            const json = await res.json();
            phaserRef.current?.loadReplay(json);
        }
    };

    useEffect(() => {
        console.log("CaroPage mounted with tourId:", tourId);
        const fetchMatches = async () => {
            try {
                const response = await fetch(
                    `${BACKEND}/tournaments/${tourId}/matches`,
                    {
                        method: "GET",
                    }
                );
                const data = await response.json();
                console.log("Fetched matches:", data);
                setMatchList(data);
            } catch (error) {
                console.error("Error fetching matches:", error);
            }
        };
        const fectchSubmissions = async () => {
            try {
                const response = await fetch(
                    `${BACKEND}/tournaments/${tourId}/submissions`,
                    {
                        method: "GET",
                    }
                );
                const data = await response.json();
                console.log("Fetched submissions:", data);
                setUsers(data);
            } catch (error) {
                console.error("Error fetching submissions:", error);
            }
        };
        fectchSubmissions();

        fetchMatches();
    }, [tourId]);

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
                {selectedMatch && (
                    <div className={styles.caroMatchInfo}>
                        <p>Match ID: {selectedMatch.matchId}</p>
                        <p>Winner: {selectedMatch.winner?.handle || "TBD"}</p>
                        {selectedMatch.status === "FINISHED" && (
                            <button onClick={handleStartReplay}>Replay</button>
                        )}
                    </div>
                )}

                <div className={styles.matchHistory}>
                    <h3>Match History</h3>
                    {matchList.map((match) => (
                        <div
                            key={match.matchId}
                            className={styles.matchCard}
                            onClick={() => setSelectedMatch(match)}
                        >
                            <div className={styles.matchId}>
                                {match.matchId}
                            </div>
                            <div className={styles.matchPlayers}>
                                {match.winner?.handle || "TBD"}
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
                            key={index}
                            className={`${
                                styles.userCard
                            }                            ${
                                selectedUsers.includes(user.submissionId)
                                    ? styles.selected
                                    : ""
                            }
                        `}
                            onClick={() =>
                                toggleUserSelection(user.submissionId, false)
                            }
                        >
                            <div className={styles.userRank}>#{index + 1}</div>

                            <div className={styles.userInfo}>
                                <div className={styles.userName}>
                                    {user.handle}
                                </div>
                                <div className={styles.userStats}>
                                    {user.problemCode} - {user.language}
                                </div>
                                {/* <div className={styles.userStats}>
                                    Wins: <span>{user.wins}</span>
                                </div> */}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
