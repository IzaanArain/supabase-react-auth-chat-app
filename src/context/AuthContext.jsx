import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [session, setSession] = useState(undefined);

    // sign up 
    const signUpNewUser = async ({ email, password }) => {
        try {
            console.log({email, password})
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password
            });

            if (error) {
                console.error(`there was a problem signing up: ${error}`);
                return { success: false, error: error.message };
            }

            console.log("sign-up success: ",data);
            return { success: true, data };
        } catch (error) {
            console.error("an error occurred: ", error);
        }
    };

    // sign in
    const signinUser =async ({ email, password } ) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if(error) {
                console.error('sign in error occurred: ', error);
                return { success: false, error: error.message}
            };

            console.log('sign-in success: ', data)
            return { success: true, data}
        } catch (error) {
            console.error("an error occurred: ", error);
        }
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    // sign out
    const signOut = () => {
        const { error } = supabase.auth.signOut();
        if (error) {
            console.error("there was an error", error);
        }
    };

    // Google OAuth signup with supabase
    const signupWithGoogle = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google'
            });
            if (error) {
                console.error(`there was a problem google sign up: ${error}`);
                return { success: false, error: error.message };
            }

            console.log("google sign-up success: ",data);
            return { success: true, data };
        } catch (error) {
            console.error("an error occurred: ", error);
        }
    }

    return (
        <AuthContext.Provider value={{ session, signUpNewUser, signOut, signinUser, signupWithGoogle }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuthContext = () => {
    return useContext(AuthContext)
}