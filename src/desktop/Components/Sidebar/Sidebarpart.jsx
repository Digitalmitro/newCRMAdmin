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
function Sidebarpart() {
  const { getChannels } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [channels, setChannels] = useState([]);
  const { getAllRecentUsers, userData } = useAuth();
  const [openChatId, setOpenChatId] = useState(null);
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

  useEffect(() => {
    channel();
    allUsers();
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
            Admin
            <img src={arrow} alt="" className="w-[8px] pt-1" />
          </h2>
          <img src={edit} alt="" className="w-[10px] h-[10px]" />
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
                        backgroundColor: `hsl(${Math.floor(Math.random() * 360)}, 70%, 40%)`,
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
          <ul className="mt-2">
            {employees?.slice(0, 4).map((user, i) => (
              <li
                key={i}
                className="block p-2 text-gray-700 text-[14px] font-medium cursor-pointer"
                onClick={() => handleChat(user.name, user.id)}
              >
                <p className="flex space-x-2">
                  <span
                    className="border items-center  flex justify-center w-5 h-5 text-[12px] font-medium text-white"
                    style={{
                      backgroundColor: `hsl(${Math.floor(Math.random() * 360)}, 70%, 40%)`,
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
            <li
              className="block p-2 text-gray-700 text-[15px] cursor-pointer"
              onClick={handleCowrokers}
            >
              + Add Coworker
            </li>
          </ul>
        </div>

        {/* Notes Section */}
        <div className="mb-4">
          <h3 className="text-[15px] font-bold text-gray-600 flex gap-2">
            Notes <img src={arrow} alt="" className="w-[8px] pt-1" />
          </h3>
          <ul className="mt-2">
            {employees?.slice(0, 4).map((user, i) => (
              <li
                key={i}
                className="block p-2 text-gray-700 text-[14px] font-medium cursor-pointer"
                onClick={() => handleNotes(user.name, user.id)}
              >
                <p className="flex space-x-2">
                  <span
                    className="border items-center  flex justify-center w-5 h-5 text-[12px] font-medium text-white"
                    style={{
                      backgroundColor: `hsl(${Math.floor(Math.random() * 360)}, 70%, 40%)`,
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                  <span>{user.name}</span>

                </p>
              </li>
            ))}
            <li
              className="block p-2 text-gray-700 text-[15px] cursor-pointer"
              onClick={handleCowrokersNotes}
            >
              + Add Coworker
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Sidebarpart;
