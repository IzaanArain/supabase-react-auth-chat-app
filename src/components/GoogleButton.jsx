import { useState } from 'react'
import { useAuthContext } from '../context/AuthContext.jsx'

const GoogleButton = () => {
    const [error, setError] = useState('');
    const { signupWithGoogle } = useAuthContext();

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const result = await signupWithGoogle();

            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error)
            }
        } catch (error) {
            setError('an error occurred')
        }
    };

    return (
        <div className='mt-6 w-full'>
            <button onClick={handleSignUp} className='w-full'>Sign in with Google</button>
            {error && <p className="text-red-600 text-center pt-4">{error}</p>}
        </div>
    )
}

export default GoogleButton