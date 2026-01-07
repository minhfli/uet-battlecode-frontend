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

type User = {
    active: boolean;
    email: string;
    handle: string;
    roles: string[];
};

export default function UserPage() {
    const [username, setUsername] = useState("Guest");
    const [userList, setUserList] = useState<User[]>([]);
    const [gameTours, setGameTours] = useState<GameTour[]>([]);
    const [submitProblem, setSubmitProblem] = useState<GameTour | null>(null);

    async function submitProblemHandler(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const fileInput = form.elements.namedItem("file") as HTMLInputElement;
        const langSelect = form.elements.namedItem(
            "language"
        ) as HTMLSelectElement;
        if (!fileInput?.files || fileInput.files.length === 0) {
            alert("Please select a file to upload.");
            return;
        }
        const file = fileInput.files[0];
        const language = langSelect.value === "py" ? "python" : "cpp";
        const requestObj = {
            handle: username,
            problemCode: submitProblem?.problemCode,
            language: language,
        };
        const formData = new FormData();
        formData.append(
            "request",
            new Blob([JSON.stringify(requestObj)], { type: "application/json" })
        );
        formData.append("file", file);
        try {
            const res = await fetch(`${BACKEND}/submissions/upload`, {
                method: "POST",
                body: formData,
            });
            if (res.ok) {
                alert("Submission successful!");
                setSubmitProblem(null);
            } else {
                const err = await res.text();
                alert("Submission failed: " + err);
            }
        } catch (error) {
            alert("Submission error: " + error);
        }
    }

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
        const fetchAvailableUsers = async () => {
            try {
                const response = await fetch(`${BACKEND}/users/`, {
                    method: "GET",
                });
                const data = await response.json();
                setUserList(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchAvailableUsers();

        fetchGameTours();
    }, []);
    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            <h1>User Page</h1>
            {username === "Guest" ? (
                <div>
                    <p>
                        User register/login are not implemented yet. Please
                        chose from the available users:
                    </p>
                    <select
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    >
                        <option value="Guest">-- Select User --</option>
                        {userList.map((user) => (
                            <option key={user.handle} value={user.handle}>
                                {user.handle} {user.active ? "" : "(Inactive)"}
                            </option>
                        ))}
                    </select>
                    {/* <button onClick={tryRegister}>Login / Register</button> */}
                </div>
            ) : (
                <p>Welcome, {username}!</p>
            )}
            {username !== "Guest" && (
                <div>
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
                </div>
            )}
            {/* Submit problem form*/}
            {submitProblem && (
                <form
                    className={styles.submitForm}
                    onSubmit={submitProblemHandler}
                >
                    <h3>Submit Problem</h3>
                    <h3
                        onClick={() => setSubmitProblem(null)}
                        style={{
                            cursor: "pointer",
                            position: "absolute",
                            top: 12,
                            right: 18,
                        }}
                    >
                        X
                    </h3>
                    <input name="file" type="file" accept=".cpp,.py" />
                    <select name="language" id="language-select">
                        <option value="cpp">C++</option>
                        <option value="py">Python</option>
                    </select>
                    <button type="submit">Submit</button>
                </form>
            )}
        </div>
    );
}
