import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { useAuthContext } from "../context/AuthContext.jsx";
import GoogleButton from "../components/GoogleButton.jsx";

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setloading] = useState('');

  const navigate = useNavigate();

  const { session, signUpNewUser } = useAuthContext();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setloading(true);
    try {
      const result = await signUpNewUser({ email, password });

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError('an error occurred')
    } finally {
      setloading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="max-w-md m-auto pt-24">
      <h2 className="font-bold pb-2">Sign up today!</h2>
      <p>Already have a account? <Link to={'/signin'}>Sign in!</Link></p>
      <div className="flex flex-col py-4">
        <input
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Email'
          className="p-3 mt-6"
          type="email"
          name="email"
          id="email" />
        <input
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="p-3 mt-6"
          type="password"
          name="password"
          id="password" />
        <button type="submit" disabled={loading} className="mt-6 w-full">
          Sign up
        </button>
        <GoogleButton/>
        {error && <p className="text-red-600 text-center pt-4">{error}</p>}
      </div>
    </form>
  )
}

export default Signup;