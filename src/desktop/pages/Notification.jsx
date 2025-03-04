import { useEffect, useState } from "react";

const employees = [
  "Loknath Pandit",
  "Amit Sharma",
  "Priya Verma",
  "Rahul Gupta",
  "Sonia Mehta",
];

export default function NotificationSystem() {
  const [emp, setEmp] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [message, setMessage] = useState("");

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/auth/`);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setEmp(data)
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchEmployees()
  },[]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees([...employees]);
    }
    setSelectAll(!selectAll);
  };

  const handleIndividualSelect = (name) => {
    let updatedSelection = [...selectedEmployees];
    if (updatedSelection.includes(name)) {
      updatedSelection = updatedSelection.filter((emp) => emp !== name);
    } else {
      updatedSelection.push(name);
    }
    setSelectedEmployees(updatedSelection);
    setSelectAll(updatedSelection.length === employees.length);
  };

  const sendNotification = () => {
    if (selectedEmployees.length === 0 || !message) {
      alert("Please select employees and enter a message.");
      return;
    }
    alert(`Notification sent to: ${selectedEmployees.join(", ")}`);
  };

  return (
    <div className="flex gap-6 p-6">
      {/* Employee List */}
      <div className="w-1/3 p-4 h-[500px] overflow-auto border border-gray-300 rounded shadow-md">
        <h2 className="text-[16px] font-semibold mb-2">Employees</h2>
        <label className="flex items-center gap-2 mb-2 cursor-pointer text-[15px] text-gray-600">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
          />
          Select All
        </label>
        {emp.reverse().map((employee,i) => (
          <label
            key={i}
            className="flex items-center gap-2 mb-1 cursor-pointer text-[15px] text-gray-600"
          >
            <input
              type="checkbox"
              checked={selectedEmployees.includes(name)}
              onChange={() => handleIndividualSelect(name)}
            />
            {employee.name}
          </label>
        ))}
      </div>

      {/* Push Notification System */}
      <div className="w-2/3 p-4  border rounded border-gray-300 shadow-md">
        <h2 className="text-[15px]  font-semibold mb-2">Push Notification</h2>
        <textarea
          className="w-full p-2 border rounded mb-4 outline-none border-gray-300 text-gray-700"
          placeholder="Enter your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="flex justify-end">
          <button
            onClick={sendNotification}
            className="px-2  text-orange-500 border border-orange-500 rounded "
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
