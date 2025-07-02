// src/components/ToastProvider.jsx
import { Toaster } from "react-hot-toast";

const ToastProvider = () => {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                style: {
                    background: "#333",
                    color: "#fff",
                    borderRadius: "8px",
                    padding: "12px 16px",
                },
                success: {
                    iconTheme: {
                        primary: "#4ade80", // green
                        secondary: "#1e1e1e",
                    },
                },
                error: {
                    iconTheme: {
                        primary: "#f87171", // red
                        secondary: "#1e1e1e",
                    },
                },
            }}
        />
    );
};

export default ToastProvider;
