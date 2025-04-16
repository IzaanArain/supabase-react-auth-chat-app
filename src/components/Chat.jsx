import React, { useEffect, useState, useRef } from 'react'
import { useAuthContext } from "../context/AuthContext.jsx"
import { useNavigate } from "react-router";
import { supabase } from '../lib/supabase.js';
import { Trash2 } from 'lucide-react';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [userOnline, setUserOnline] = useState([]);
    const { session, signOut } = useAuthContext();
    const navigate = useNavigate();

    const chatContainerRef = useRef(null);
    const scroll = useRef();

    const handleSignOut = async (e) => {
        e.preventDefault();
        try {
            await signOut();
            navigate('/signin')
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from("Messages")
            .select("*")
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error loading chat history:", error);
        } else {
            setMessages(data);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    useEffect(() => {
        if (!session?.user) {
            setUserOnline([]);
            return;
        }

        const roomOne = supabase.channel('room_one', {
            config: {
                presence: {
                    key: session?.user?.id,
                }
            }
        });

        roomOne.on("broadcast", { event: "message" }, (payload) => {
            setMessages((prevMessages) => [...prevMessages, payload.payload]);
        });

        // track user presence subscribe!
        roomOne.subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
                await roomOne.track({
                    id: session?.user?.id
                })
            }
        });

        // handle user presence
        roomOne.on("presence", { event: "sync" }, () => {
            const state = roomOne.presenceState();
            setUserOnline(Object.keys(state));
        });

        return () => {
            roomOne.unsubscribe();
        }
    }, [session]);

    // send message
    const sendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === "") return;

        const messageData = {
            message: newMessage,
            user_name: session?.user?.user_metadata?.email,
            avatar: session?.user?.user_metadata?.avatar_url,
            created_at: new Date().toISOString(),
            user_id: session?.user?.id,  // Add the user_id to the message data
        };

        // Save message to the database
        const { data, error } = await supabase
            .from("Messages")
            .insert([messageData]);

        if (error) {
            console.error("DB Error sending message:", error);
            return;
        }

        supabase.channel("room_one").send({
            type: "broadcast",
            event: "message",
            payload: messageData
        });

        setNewMessage("");
    }

    const formatTime = (isoString) => {
        return new Date(isoString).toLocaleTimeString("en-us", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    };

    // Delete message
    const deleteMessage = async (messageId, userId) => {
        // Check if the current user is the owner of the message
        if (session?.user?.id !== userId) {
            console.error("You can only delete your own messages.");
            return;
        }

        // Delete the message from the database
        const { error } = await supabase
            .from('Messages')
            .delete()
            .eq('id', messageId);

        if (error) {
            console.error("Error deleting message:", error);
            return;
        }

        // Remove the deleted message from the UI
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
    };

    useEffect(() => {
        setTimeout(() => {
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
        }, [100]);
    }, [messages]);

    return (
        <div className='border-[1px] border-gray-700 max-w-6xl w-full min-h-[600px] rounded-lg'>
            {/* header */}
            <header className='flex justify-between h-20 border-b-[1px] border-gray-700'>
                <div className='p-4'>
                    <p className='text-gray-300'>signed in as {session?.user?.user_metadata?.full_name ? session?.user?.user_metadata?.full_name : session?.user?.email}</p>
                    <p className='text-gray-300 italic text-sm'>{userOnline.length} users online</p>
                </div>
                <button onClick={handleSignOut} className='m-2 sm:mr-4'>sign out</button>
            </header>

            {/* main chat */}
            <section
                className='p-4 flex flex-col overflow-y-auto h-[500px]'
                ref={chatContainerRef}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`my-2 flex w-full items-start ${msg?.user_name === session?.user?.email
                            ? 'justify-end'
                            : "justify-start"
                            }`}>
                        {/* received message - avatar on left */}
                        {msg.user_name !== session?.user?.email && (
                            <img
                                src={msg.avatar || '/default-avatar.jpg'}
                                alt='/'
                                className='w-10 h-10 rounded-full mr-2' />
                        )}
                        <div className='flex flex-col w-full'>
                            <div className={`p-1 max-w-[70%] rounded-xl ${msg.user_name === session?.user?.email
                                ? 'bg-gray-700 text-white ml-auto'
                                : 'bg-gray-500 text-white mr-auto'
                                }`}>
                                <p>{msg.message}</p>
                            </div>
                            {/* timestamp */}
                            <div className={`text-xs opacity-75 pt-1 ${msg.user_name === session?.user?.email
                                ? "text-right mr-2"
                                : "text-left ml-2"
                                }`}>
                                {formatTime(msg?.created_at)}
                            </div>
                        </div>

                        {/* Only show delete button for messages sent by the user */}
                        {msg.user_id === session?.user?.id && (
                            <button
                                onClick={() => deleteMessage(msg.id, msg.user_id)}
                                className="ml-2 text-red-500"
                            >
                                <Trash2 />
                            </button>
                        )}
                    </div>
                ))}
            </section>

            {/* message input */}
            <form onSubmit={sendMessage} className='flex flex-col sm:flex-row p-4 border-t-[1px] border-gray-700'>
                <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    type="text"
                    placeholder='Type a message...'
                    className='p-2 w-full bg-[#000000] rounded-lg'
                />
                <button className='mt-4 sm:mt-0 sm:ml-8 bg-blue-500 text-white max-h-12'>
                    Send
                </button>
                <span ref={scroll}></span>
            </form>
        </div>
    );
}

export default Chat;
