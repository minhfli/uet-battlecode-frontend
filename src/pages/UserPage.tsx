import { useEffect, useState } from "react";
import { BACKEND } from "../config/constant";
import styles from "./UserPage.module.css";
type GameTour = {
    id: number;
    name: string;
    problemCode: string;
    organizerHandle: string;
    status?: string; //"ENDED" | "PLAYING" | "WAITING"
};

export default function UserPage() {
    const [username, setUsername] = useState("Guest");
    const [tempUsername, setTempUsername] = useState("");
    const [gameTours, setGameTours] = useState<GameTour[]>([]);
    const [submitProblem, setSubmitProblem] = useState<GameTour | null>(null);

    function tryRegister() {
        alert("Register/Login feature is not implemented yet.");
        setUsername(tempUsername || "Guest");
    }

    function submitProblemHandler() {}

    useEffect(() => {
        const fetchGameTours = async () => {
            try {
                const response = await fetch(`${BACKEND}/tournaments/`, {
                    method: "GET",
                });

                console.log(response);
                const data = await response.json();
                console.log(data);
                setGameTours(data);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách giải đấu:", error);
            }
        };

        fetchGameTours();
    }, []);
    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            <h1>User Page</h1>
            {username === "Guest" ? (
                <div>
                    <p>Register/Login</p>
                    <input
                        type="text"
                        value={tempUsername}
                        onChange={(e) => setTempUsername(e.target.value)}
                    />
                    <button onClick={tryRegister}>Submit</button>
                </div>
            ) : (
                <p>Welcome, {username}!</p>
            )}

            <h2>Game Tours</h2>
            <ul>
                {gameTours.map((tour) => (
                    <li
                        key={tour.id}
                        className={styles.tourItem}
                        onClick={() => setSubmitProblem(tour)}
                    >
                        {tour.name} - {tour.problemCode} - Organizer:{" "}
                        {tour.organizerHandle} - Status:{" "}
                        {tour.status || "WAITING"}
                    </li>
                ))}
            </ul>
            {/* Submit problem form*/}
            {submitProblem && (
                <form
                    style={{
                        marginTop: 20,
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                    }}
                >
                    <h3>Submit Problem</h3>
                    <h3
                        onClick={() => setSubmitProblem(null)}
                        style={{ cursor: "pointer" }}
                    >
                        X
                    </h3>
                    <input type="file" accept=".cpp,.py" />
                    <button type="submit">Submit</button>
                </form>
            )}
        </div>
    );
}
