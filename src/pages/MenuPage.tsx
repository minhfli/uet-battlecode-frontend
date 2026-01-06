import { useNavigate } from "react-router-dom";
import { useState, type FormEvent, type ChangeEvent, useEffect } from "react";
import { BACKEND } from "../config/constant";
import styles from "./MenuPage.module.css";

type GameTour = {
    id: number;
    name: string;
    problemCode: string;
    organizerHandle: string;
    status?: string; //"ENDED" | "PLAYING" | "WAITING"
};
export default function MenuPage() {
    const nav = useNavigate();
    const [form, setForm] = useState({
        name: "",
        problemCode: "",
        organizerHandle: "admin",
    });
    const [submitting, setSubmitting] = useState(false);
    const handleChange = (
        e: ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        // TODO: Gọi API tạo tournament ở đây
        console.log("Tạo tournament:", form);
        setTimeout(() => {
            setSubmitting(false);
            setForm({
                name: "",
                problemCode: "",
                organizerHandle: "admin",
            });
            alert("Tạo tournament thành công!");
        }, 1000);
    };
    const [gameTours, setGameTours] = useState<GameTour[]>([]);
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
        <div style={{ padding: 40 }}>
            <h1>BATTLE CODE</h1>
            <div className={styles.menuBody}>
                <div
                    style={{
                        margin: "32px 0",
                        padding: "20px",
                        background: "#f9f9f9",
                        borderRadius: 8,
                        width: "300px",
                    }}
                >
                    <h2>Tạo giải đấu mới</h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 12 }}>
                            <label>Tên giải đấu:</label>
                            <br />
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                style={{ width: "100%", padding: "6px" }}
                            />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label>Type:</label>
                            <br />
                            <select
                                name="type"
                                value={form.problemCode}
                                onChange={handleChange}
                                required
                                style={{ width: "100%", padding: 6 }}
                            >
                                <option value="tic-tac-toe-5">Caro</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            style={{ padding: "8px 16px" }}
                        >
                            {submitting ? "Đang tạo..." : "Tạo giải đấu"}
                        </button>
                    </form>
                </div>
                <div className={styles.gameTourList}>
                    {gameTours.map((tour) => (
                        <div
                            key={tour.id}
                            className={styles.gameTourCard}
                            onClick={() => nav(`/caro/${tour.id}`)}
                        >
                            <div className={styles.gameTourHeader}>
                                <span
                                    className={`${styles.tourStatus} ${
                                        styles[
                                            "status-" +
                                                (tour.status || "WAITING")
                                        ]
                                    }`}
                                >
                                    {tour.status || "WAITING"}
                                </span>
                            </div>
                            <p>{tour.id}</p>
                            <h3 className={styles.tourName}>{tour.name}</h3>
                            <p className={styles.tourDescription}>
                                {tour.problemCode} - Organizer:{" "}
                                {tour.organizerHandle}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
