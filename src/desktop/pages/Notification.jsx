import { useEffect, useState } from "react";

export default function NotificationSystem() {
  const [emp, setEmp] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [message, setMessage] = useState({
    title: "",
    description: "",
  });

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/auth/`);
      if (response.ok) {
        const data = await response.json();
        setEmp(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees(""); 
    } else {
      setSelectedEmployees("ALL"); 
    }
    setSelectAll(!selectAll);
  };

  const handleIndividualSelect = (id) => {
    let updatedSelection = [...selectedEmployees];

    if (updatedSelection.includes(id)) {
      updatedSelection = updatedSelection.filter((empId) => empId !== id);
    } else {
      updatedSelection.push(id);
    }

 
    if (updatedSelection.length === emp.length) {
      setSelectedEmployees(["ALL"]);
      setSelectAll(true);
    } else {
      setSelectedEmployees(updatedSelection);
      setSelectAll(false);
    }
  };

  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    if (!name) return;
    setMessage({
      ...message,
      [name]: value,
    });
  };

  const sendNotification = async () => {
    if (selectedEmployees.length === 0) {
      alert("Please select employees and enter a message.");
      return;
    }
  
    const token = localStorage.getItem("token");
    
   
  
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/notification/send-notification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...message,
            userId: selectedEmployees, 
          }),
        }
      );
  
      const data = await response.json();
  
  
      if (response.ok) {
        alert("Notification sent successfully!");
        setMessage({ title: "", description: "" });
        setSelectedEmployees([]);
        setSelectAll(false);
      }
    } catch (error) {
      console.log("Error sending notification:", error);
    }
  };
  

  return (
    <div className="flex gap-6 p-6">
      {/* Employee List */}
      <div className="w-1/3 p-4 border border-gray-300 rounded shadow-md"> 
        <h2 className="text-[16px] font-semibold mb-2 font-serif">Employees</h2>
        <div className="h-[430px] overflow-auto">
        <label className="flex items-center gap-2 mb-2 cursor-pointer text-[15px] text-gray-600">
          <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
          Select All
        </label>
        {emp.map((employee, i) => (
          <label key={i} className="flex items-center gap-2 mb-1 cursor-pointer text-[15px] text-gray-600">
            <input
              type="checkbox"
              checked={selectedEmployees.includes(employee._id) || selectedEmployees.includes("ALL")}
              onChange={() => handleIndividualSelect(employee._id)}
            />
            {employee.name}
          </label>
        ))}
        </div>
      </div>

      {/* Push Notification System */}
      <div className="w-2/3 p-4 border rounded border-gray-300 shadow-md">
        <h2 className="text-[15px] font-serif font-semibold mb-2">Notification</h2>
        <div className="flex flex-col mt-4">
          <label htmlFor="title" className="text-[15px] font-medium font-serif">
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            className="w-full p-2 border rounded mb-4 outline-none border-gray-300 text-gray-700"
            placeholder="Give a Title"
            onChange={handleChange}
            value={message?.title}
            required
          />
        </div>
        <label htmlFor="description" className="text-[15px] font-medium font-serif">
          Description
        </label>
        <textarea
          className="w-full p-2 border rounded mb-4 outline-none border-gray-300 text-gray-700"
          name="description"
          placeholder="Enter your message..."
          value={message?.description}
          onChange={handleChange}
          required
        />
        <div className="flex justify-end">
          <button onClick={sendNotification} className="px-2 text-orange-500 border border-orange-500 rounded">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
