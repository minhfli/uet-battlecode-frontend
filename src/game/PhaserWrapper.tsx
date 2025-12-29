import { forwardRef, useEffect, useRef } from "react";
import PhaserGame from "./PhaserGame.ts";

export default forwardRef(function PhaserWrapper(_, ref) {
    const divRef = useRef<HTMLDivElement>(null);
    const gameRef = useRef<any>(null);

    useEffect(() => {
        gameRef.current = new PhaserGame(divRef.current!);
        if (ref) (ref as any).current = gameRef.current;

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy();
                gameRef.current = null;
            }
        };
    }, []);

    return (
        <div
            ref={divRef}
            style={{
                position: "absolute",
                inset: 0,
            }}
        />
    );
});
