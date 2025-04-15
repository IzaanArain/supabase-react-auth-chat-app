import { Link } from "react-router";

const Dashboard = ({ children }) => {
  return (
    <div className="w-full h-screen flex flex-col p-4">
      <nav className="flex gap-4 mb-4 border-b pb-2">
        <Link to="/chat" className="text-blue-500 hover:underline">Chat</Link>
        <Link to="/dashboard" className="text-blue-500 hover:underline">Todo</Link>
      </nav>
      <div className="flex-1 flex justify-center items-center">
        {children}
      </div>
    </div>
  );
};

export default Dashboard;
