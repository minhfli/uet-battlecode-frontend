import { useNavigate } from "react-router-dom";
import { useState, type FormEvent, type ChangeEvent } from "react";

import styles from "./MenuPage.module.css";

type GameTour = {
    id: number;
    date: Date;
    type: string;
    name: string;
    description: string;
    status?: string; //"ENDED" | "PLAYING" | "WAITING"
};
export default function MenuPage() {
    const nav = useNavigate();
    const [form, setForm] = useState({
        name: "",
        description: "",
        type: "",
        startDate: "",
        endDate: "",
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
                description: "",
                type: "",
                startDate: "",
                endDate: "",
            });
            alert("Tạo tournament thành công!");
        }, 1000);
    };
    const gameTours: GameTour[] = [
        {
            id: 1,
            date: new Date(2025, 11, 25),
            type: "tic-tac-toe-5",
            name: "Caro Tournament 01",
            description: "2025 Caro Tournament - Join Now!",
            status: "PLAYING",
        },
        {
            id: 2,
            date: new Date(2026, 0, 1),
            type: "tic-tac-toe-5",
            name: "Caro Championship 2026",
            description: "Compete in the new year championship!",
            status: "WAITING",
        },
        {
            id: 3,
            date: new Date(2024, 5, 15),
            type: "tic-tac-toe-5",
            name: "Caro test 2024",
            description: "Just a test tournament",
            status: "ENDED",
        },
    ];

    gameTours.sort((a, b) => b.date.getTime() - a.date.getTime());

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
                            <label>Mô tả:</label>
                            <br />
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                required
                                style={{ width: "100%", padding: 6 }}
                            />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label>Type:</label>
                            <br />
                            <select
                                name="type"
                                value={form.type}
                                onChange={handleChange}
                                required
                                style={{ width: "100%", padding: 6 }}
                            >
                                <option value="tic-tac-toe-5">Caro</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label>Ngày bắt đầu:</label>
                            <br />
                            <input
                                type="date"
                                name="startDate"
                                value={form.startDate}
                                onChange={handleChange}
                                required
                                style={{ padding: 6 }}
                            />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label>Ngày kết thúc:</label>
                            <br />
                            <input
                                type="date"
                                name="endDate"
                                value={form.endDate}
                                onChange={handleChange}
                                required
                                style={{ padding: 6 }}
                            />
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
                                <span className={styles.tourDate}>
                                    {tour.date.toDateString()}
                                </span>
                            </div>

                            <h3 className={styles.tourName}>{tour.name}</h3>
                            <p className={styles.tourDescription}>
                                {tour.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
