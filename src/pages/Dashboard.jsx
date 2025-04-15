import { Link, useNavigate } from "react-router";
import { useAuthContext } from "../context/AuthContext.jsx";

const Dashboard = ({ children }) => {
  const { signOut, session } = useAuthContext(); // destructure once
  const navigate = useNavigate();       // move outside handler

  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      await signOut();
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col p-4  text-white">
      <nav className="flex gap-4 mb-4 border-b border-zinc-800 pb-2">
        <Link
          to="/chat"
          className="text-green-400 hover:text-green-300 transition-colors"
        >
          Chat
        </Link>
        <Link
          to="/dashboard"
          className="text-green-400 hover:text-green-300 transition-colors"
        >
          Todo
        </Link>
        {session?.user?.user_metadata && <p className='text-gray-300'>{session?.user?.user_metadata?.full_name ? session?.user?.user_metadata?.full_name : session?.user?.email}</p>}
        <button
          onClick={handleSignOut}
          className="ml-auto px-3 py-1 bg-red-600 hover:bg-red-500 rounded-lg text-white font-medium transition"
        >
          Sign out
        </button>
      </nav>

      <div className="flex-1 flex justify-center items-center">
        {children}
      </div>
    </div>
  );
};

export default Dashboard;
