import { Link, useNavigate } from "react-router-dom";
import home from "../../../assets/desktop/home.svg";
import attendence from "../../../assets/desktop/attendence.svg";
import bidirection from "../../../assets/desktop/bidirection.svg";
import book from "../../../assets/desktop/book.svg";
import calls from "../../../assets/desktop/calls.svg";
import notes from "../../../assets/desktop/notes.svg";
import sales from "../../../assets/desktop/sales.svg";
import arrow from "../../../assets/desktop/arrow.svg";
import edit from "../../../assets/desktop/edit.svg";
import logo from "../../../assets/desktop/logo.svg";
import { TbBrandDatabricks } from "react-icons/tb";
import { BiStreetView } from "react-icons/bi";
import { useAuth } from "../../../context/authContext";
import { useEffect, useState } from "react";
import socket from "../../../utils/socket";
import axios from "axios";

const getStableColor = (text = "DM") => {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0; // Convert to 32bit integer
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 40%)`;
};
function Sidebarpart() {
  const { getChannels } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [channels, setChannels] = useState([]);
  const { getAllRecentUsers, userData } = useAuth();
  const [openChatId, setOpenChatId] = useState(null);
  const [adminProfile, setAdminProfile] = useState(() => {
    const stored = localStorage.getItem("admin");
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch (error) {
      return null;
    }
  });
  const [isEditAdminOpen, setIsEditAdminOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminError, setAdminError] = useState("");
  const navigate = useNavigate();

  const channel = async () => {
    const data = await getChannels();
    setChannels(data);
  };
  const allUsers = async () => {
    const users = await getAllRecentUsers();
    const unreadCounts = {};
    users.forEach(user => {
      unreadCounts[user.id] = user.unreadMessages || 0;
    });
    setUnreadCounts(unreadCounts);
    setEmployees(users);
  };

  const loadAdminProfile = async () => {
    const stored = localStorage.getItem("admin");
    if (stored) {
      try {
        setAdminProfile(JSON.parse(stored));
      } catch (error) {
        setAdminProfile(null);
      }
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/auth/admin/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data?.admin) {
          setAdminProfile(data.admin);
          localStorage.setItem("admin", JSON.stringify(data.admin));
        }
      }
    } catch (error) {
      //(error);
    }
  };

  useEffect(() => {
    channel();
    allUsers();
    loadAdminProfile();
    socket.on("updateUnread", async () => {
      allUsers()
    });

    return () => {
      socket.off("updateUnread");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const chatState = location.state;
    if (chatState && chatState.id) {
      setOpenChatId(chatState.id);
    } else {
      setOpenChatId(null);
    }
  }, [location]);

  const handleCowrokers = () => {
    navigate("/addCoworker");
  };
  const handleCowrokersNotes = () => {
    navigate("/addCoworker", {
      state: { from: "/notes" }
    });
  };

  const handleChat = async (name, id) => {

    //(id);
    setOpenChatId(id);
    setUnreadCounts(prev => ({
      ...prev,
      [id]: 0
    }));
    navigate("/chat", {
      state: {
        name,
        id,
      },
    });
    await axios.post(
      `${import.meta.env.VITE_BACKEND_API}/message/messages/mark-as-read`,
      { senderId: id },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
  };
  const handleChannel = () => {
    navigate("/create-channel");
  };
  const handleChannelChat = (name, id, description) => {
    navigate(`/channelchat/${id}`, {
      state: {
        name,
        description,
        id,
      },
    });
  };

  const handleNotes = (name, id) => {
    navigate("/notes", {
      state: {
        name,
        id,
      },
    });
  };

  const handleEditAdminOpen = () => {
    setAdminError("");
    setAdminForm({
      name: adminProfile?.name || "",
      email: adminProfile?.email || "",
      phone: adminProfile?.phone || "",
      password: "",
    });
    setIsEditAdminOpen(true);
  };

  const handleEditAdminClose = () => {
    setIsEditAdminOpen(false);
    setAdminError("");
  };

  const handleAdminInputChange = (e) => {
    const { name, value } = e.target;
    setAdminForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdminSave = async () => {
    if (adminSaving) return;
    setAdminSaving(true);
    setAdminError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setAdminError("Please log in again.");
      setAdminSaving(false);
      return;
    }

    const payload = {
      name: adminForm.name,
      email: adminForm.email,
      phone: adminForm.phone,
    };
    if (adminForm.password) {
      payload.password = adminForm.password;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/auth/admin/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setAdminError(data?.message || "Unable to update profile.");
        setAdminSaving(false);
        return;
      }
      const data = await response.json();
      const updated = data?.admin || null;
      if (updated) {
        setAdminProfile(updated);
        localStorage.setItem("admin", JSON.stringify(updated));
      }
      setIsEditAdminOpen(false);
    } catch (error) {
      setAdminError("Unable to update profile.");
    } finally {
      setAdminSaving(false);
    }
  };

  //(employees);

  return (
    <div className="  flex ">
      <div className="px-3 pt-2 border border-orange-400">
        {/* Navigation Links */}
        <nav className="flex flex-col gap-1  items-center">
          <Link to="/" className="flex items-center">
            <div className="flex flex-col items-center">
              <img src={logo} alt="" className="h-[70px] w-[70px]" />
            </div>
          </Link>
          <Link to="/" className="flex items-center gap-2 p-2 ">
            <div className="flex flex-col  items-center">
              <img src={home} alt="" className="h-[25px] w-[25px]" />
              <p className="text-[12px] font-semibold">Home</p>
            </div>
          </Link>
          <Link to="/attendance" className="flex items-center gap-2 p-2 ">
            <div className="flex flex-col   items-center">
              <img src={attendence} alt="" className="h-[20px] w-[20px]" />
              <p className="text-[12px] font-semibold">Attendance</p>
            </div>
          </Link>
          <Link to="/projects" className="flex items-center gap-2 p-2 ">
            <div className="flex flex-col  items-center">
              <img src={book} alt="" className="h-[20px] w-[20px]" />
              <p className="text-[12px] font-semibold">Projects</p>
            </div>
          </Link>
          <Link to="/callbacklist" className="flex items-center gap-2 p-2 ">
            <div className="flex flex-col items-center">
              <img src={calls} alt="" className="h-[25px] w-[25px]" />
              <p className="text-[12px] font-semibold">Callback</p>
            </div>
          </Link>
          <Link to="/transferlist" className="flex items-center gap-2 p-2">
            <div className="flex flex-col  items-center">
              <img src={bidirection} alt="" className="h-[20px] w-[20px]" />
              <p className="text-[12px] font-semibold">Transfer</p>
            </div>
          </Link>
          <Link to="/saleslist" className="flex items-center gap-2 p-2">
            <div className="flex flex-col  items-center">
              <img src={sales} alt="" className="h-[25px] w-[25px]" />
              <p className="text-[12px] font-semibold">Sales</p>
            </div>
          </Link>
          <Link to="/employee" className="flex items-center gap-2 p-2 ">
            <div className="flex space-x-2 flex-col   items-center">
              <BiStreetView size={28} />
              <p className="text-[12px] font-semibold text-center">Activity </p>
            </div>
          </Link>
          <Link to="/concern" className="flex items-center gap-2 p-2 ">
            <div className="flex space-x-2 flex-col   items-center">
              <TbBrandDatabricks size={23} />
              <p className="text-[12px] font-semibold">Concern</p>
            </div>
          </Link>
          <Link to="/notification" className="flex items-center gap-2 p-2">
            <div className="flex space-x-2  flex-col items-center">
              <img src={notes} alt="" className="h-[20px] w-[20px]" />
              <p className="text-[12px] font-semibold">Notifications </p>
            </div>
          </Link>


        </nav>
      </div>

      <div className="bg-gray-200 w-[250px] p-4 border border-orange-400">
        <div className="flex justify-between items-center pt-4 mb-4">
          <h2 className="text-[18px] font-medium   flex gap-2">
            {adminProfile?.name || "Admin"}
            <img src={arrow} alt="" className="w-[8px] pt-1" />
          </h2>
          <button type="button" onClick={handleEditAdminOpen}>
            <img src={edit} alt="Edit admin profile" className="w-[10px] h-[10px]" />
          </button>
        </div>

        {/* Channels Section */}
        <div className="mb-4 pt-8">
          <h3 className="text-[15px] font-bold text-gray-600 flex gap-2">
            Channels <img src={arrow} alt="" className="w-[8px] pt-1" />
          </h3>
          <ul className="mt-2">
            {channels?.map((channel) => (
              <li key={channel._id}>
                <p
                  className="block p-2 text-gray-700 font-medium text-[14px] cursor-pointer"
                  onClick={() => handleChannelChat(channel.name, channel._id, channel.description)}
                >
                  <p className="flex space-x-2">
                    <span
                      className="border items-center  flex justify-center w-5 h-5 text-[12px] font-medium text-white"
                      style={{
                        backgroundColor: getStableColor(channel?.name),
                      }}
                    >
                      {channel?.name?.charAt(0).toUpperCase()}
                    </span>
                    <span>{channel.name}</span>
                  </p>

                </p>
              </li>
            ))}
            <li>
              <p
                className="block p-2 text-gray-700 text-[13px] cursor-pointer"
                onClick={handleChannel}
              >
                + Add Channels
              </p>
            </li>
          </ul>
        </div>

        {/* Messages Section */}
        <div className="mb-4">
          <h3 className="text-[15px] font-bold text-gray-600 flex gap-2">
            Messages <img src={arrow} alt="" className="w-[8px] pt-1" />
          </h3>
          <ul className="mt-2 max-h-[260px] overflow-y-auto pr-1">
            {employees?.map((user, i) => (
              <li
                key={i}
                className="block p-2 text-gray-700 text-[14px] font-medium cursor-pointer"
                onClick={() => handleChat(user.name, user.id)}
              >
                <p className="flex space-x-2">
                  <span
                    className="border items-center  flex justify-center w-5 h-5 text-[12px] font-medium text-white"
                    style={{
                      backgroundColor: getStableColor(user?.name),
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                  <span>{user.name}</span>
                  {unreadCounts[user.id] > 0 && openChatId !== user.id && (
                    <span className="text-green-500 font-bold">
                      ({unreadCounts[user.id]})
                    </span>
                  )}
                </p>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="block p-2 text-gray-700 text-[15px] cursor-pointer"
            onClick={handleCowrokers}
          >
            + Add Coworker
          </button>
        </div>

        {/* Notes Section */}
        <div className="mb-4">
          <h3 className="text-[15px] font-bold text-gray-600 flex gap-2">
            Notes <img src={arrow} alt="" className="w-[8px] pt-1" />
          </h3>
          <ul className="mt-2 max-h-[260px] overflow-y-auto pr-1">
            {employees?.map((user, i) => (
              <li
                key={i}
                className="block p-2 text-gray-700 text-[14px] font-medium cursor-pointer"
                onClick={() => handleNotes(user.name, user.id)}
              >
                <p className="flex space-x-2">
                  <span
                    className="border items-center  flex justify-center w-5 h-5 text-[12px] font-medium text-white"
                    style={{
                      backgroundColor: getStableColor(user?.name),
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                  <span>{user.name}</span>

                </p>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="block p-2 text-gray-700 text-[15px] cursor-pointer"
            onClick={handleCowrokersNotes}
          >
            + Add Coworker
          </button>
        </div>
      </div>

      {isEditAdminOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-semibold">Edit Admin Profile</h3>
              <button type="button" onClick={handleEditAdminClose} className="text-gray-500">
                &times;
              </button>
            </div>
            {adminError && (
              <p className="text-xs text-red-500 mt-2">{adminError}</p>
            )}
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Name</label>
                <input
                  name="name"
                  type="text"
                  value={adminForm.name}
                  onChange={handleAdminInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={adminForm.email}
                  onChange={handleAdminInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Phone</label>
                <input
                  name="phone"
                  type="text"
                  value={adminForm.phone}
                  onChange={handleAdminInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Password</label>
                <input
                  name="password"
                  type="password"
                  value={adminForm.password}
                  onChange={handleAdminInputChange}
                  placeholder="Leave blank to keep current"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleEditAdminClose}
                className="px-3 py-2 text-sm border border-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdminSave}
                className="px-3 py-2 text-sm bg-orange-500 text-white rounded"
                disabled={adminSaving}
              >
                {adminSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebarpart;
