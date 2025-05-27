import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../context/authContext";
import Select from "react-select";


export default function ChannelUpdateForm({ groupUsers, members }) {
    const location = useLocation();
    const { getAllUsers } = useAuth();
    const [allPeople, setAllPeople] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const channelId = location.pathname.split("/").at(2);
    const token = localStorage.getItem('token')

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getAllUsers();
                if (response && Array.isArray(response)) {
                    setAllPeople(response);


                    // set initial selected members
                    const selected = response
                        .filter(user => members.some(member => member?._id === user?._id))
                        .map(user => ({
                            value: user?._id,
                            label: user?.name
                        }));

                    setSelectedMembers(selected);
                }
            } catch (error) {
                //(error);
            }
        };
        fetchUsers();
    }, []);

    //(members);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Fix spelling + add selectedMembers mapping
        data.members = selectedMembers.map(member => member.value); // Get only IDs
        data.description = data.description || ""; // Handle fallback (optional)

        //("Form Data:", data);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/api/${channelId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: data.name,
                    description: data.description, // fixed typo from 'descrition'
                    members: data.members
                })
            });

            if (response.ok) {
                //("Channel updated successfully ✅");
                window.location.reload(); // Reload the page or navigate as needed
            } else {
                const errorData = await response.json();
                console.error("Update failed:", errorData.message || response.statusText);
            }
        } catch (error) {
            console.error("Something went wrong:", error);
        }
    };



    const options = allPeople.map(user => ({
        value: user._id,
        label: user.name
    }));

    return <form
        className="p-4 pt-8 space-y-2"
        onSubmit={handleSubmit}
    >
        <div>
            <h3 className="text-[15px] font-bold text-gray-600 flex gap-2 pb-3">
                Channel Settings
            </h3>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
            </label>
            <input
                type="text"
                name="name"
                placeholder="Enter channel name"
                defaultValue={
                    groupUsers?.name?.charAt(0).toUpperCase() + groupUsers?.name?.slice(1) || ""
                }
                className="w-full px-2 py-1 border border-gray-300 text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
            </label>
            <textarea
                type="text"
                defaultValue={groupUsers?.description || ""}
                name="description"
                placeholder="Enter description"
                className="w-full px-2 py-1 border border-gray-300 text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Members
            </label>
            <Select
                isMulti
                name="members"
                options={options}
                value={selectedMembers}
                onChange={setSelectedMembers}
                placeholder="Select or search users..."
                className="text-sm"
            />
        </div>

        <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-1 rounded-md font-semibold text-sm transition duration-200"
        >
            Save Channel
        </button>
    </form>
}