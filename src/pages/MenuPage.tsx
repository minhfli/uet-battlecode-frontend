import { useNavigate } from "react-router-dom";

export default function MenuPage() {
    const nav = useNavigate();

    return (
        <div style={{ padding: 40 }}>
            <h1>Bot Game Replay</h1>
            <button onClick={() => nav("/caro")}>Replay Caro</button>
        </div>
    );
}
