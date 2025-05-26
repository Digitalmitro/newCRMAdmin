import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { onSoftRefresh } from "../../utils/socket";

export default function AdminNotes() {
    const initialToken = localStorage.getItem("token");
    const location = useLocation();
    const userId = location.state?.id;
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchNotes = async () => {
            if (!initialToken) return;

            try {
                setLoading(true);
                setError(""); // reset error before new fetch

                const response = await axios.get(`${import.meta.env.VITE_BACKEND_API}/notepad/${userId}`, {
                    headers: { Authorization: `Bearer ${initialToken}` },
                });

                const data = response.data;

                if (data?.data?.notes) {
                    setNotes(data.data.notes);
                } else {
                    setError(data?.error || "No notes found for this user.");
                }

            } catch (err) {
                console.error("Error fetching notes:", err);
                setError(err?.response?.data?.error);
            } finally {
                setLoading(false);
            }
        };
        const unsubscribe = onSoftRefresh((data) => {
            if (data.type === "Notes") {
                fetchNotes();
            }

        });

        if (userId) {
            fetchNotes();
        }
        return () => unsubscribe(); // Cleanup on unmount
    }, [userId]);

    return (
        <div className="w-full mt-10 p-4">
            <div className="p-4 bg-white">
                <h2 className="text-xl font-bold mb-2 text-gray-600">Notes</h2>
                {loading && <p className="text-gray-500">Loading...</p>}
                {error && <p className="text-gray-700">{error}</p>}
                {!loading && !error && (
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-2 border rounded-lg outline-none border-gray-500"
                        placeholder="Write your notes here..."
                        rows={12}
                        disabled
                    />
                )}
            </div>
        </div>
    );
}
