import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';  // to get the dynamic route parameter
import { supabase } from '../lib/supabase';
import { useAuthContext } from "../context/AuthContext.jsx";

const TodoPage = () => {
    const { id } = useParams();  // Get the todo id from the URL
    const { session } = useAuthContext();  // Access user session
    const [todo, setTodo] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchTodo = async () => {
        const { data, error } = await supabase
            .from('Todos')
            .select('*')
            .eq('id', id)
            .eq('user_id', session?.user.id)  // Ensure the todo belongs to the current user
            .single();  // We expect only one result

        if (error) {
            console.error('Error fetching todo:', error);
        } else {
            setTodo(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTodo();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!todo) {
        return <div>Todo not found</div>;
    }

    return (
        <div className="w-full p-6 text-white rounded-2xl shadow-lg">
            <h1 className="text-2xl font-bold mb-4 text-center text-green-400">Todo: {todo.name}</h1>
            {todo.image_url && (
                <img
                    src={todo.image_url}
                    alt="todo"
                    className="w-full h-40 object-cover rounded-lg mb-3"
                />
            )}
            <p className="text-sm text-gray-400 mb-2">{todo.description}</p>
            <p className={`text-lg ${todo.isCompleted ? 'line-through text-gray-500' : ''}`}>
                {todo.isCompleted ? 'Completed' : 'Not Completed'}
            </p>
        </div>
    );
};

export default TodoPage;
