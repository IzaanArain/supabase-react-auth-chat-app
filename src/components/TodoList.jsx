import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, Trash2, Plus } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useAuthContext } from "../context/AuthContext.jsx";
import { Link } from 'react-router';

const TodoList = () => {
    const [todoList, setTodoList] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);

    const { session } = useAuthContext(); // destructure once

    const fetchTodos = async () => {
        const { data, error } = await supabase.from('Todos')
            .select('*')
            .eq('user_id', session?.user.id); // Filter by user_id;
        if (error) console.error('Error fetching todos:', error);
        else setTodoList(data);
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    const uploadImage = async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `public/${uuid()}.${fileExt}`;

        // Step 1: Upload the file
        const { data, error } = await supabase
            .storage
            .from('todo-images') // Your Supabase bucket name
            .upload(fileName, file);
        if (error) {
            console.error('Image upload error:', error);
            return null;
        }

        // Step 2: Get the public URL of the uploaded file
        const { data: publicURLData, error: urlError } = await supabase
            .storage
            .from('todo-images')
            .getPublicUrl(fileName);

        if (urlError) {
            console.error('Error retrieving public URL:', urlError);
            return null;
        }

        // Step 3: Return the public URL of the uploaded file
        return publicURLData.publicUrl;
    };


    const addTodo = async () => {
        if (!newTodo.trim()) return;

        let imageUrl = null;
        if (imageFile) {
            imageUrl = await uploadImage(imageFile);
        }

        const newTodoData = {
            name: newTodo,
            description,
            image_url: imageUrl,
            isCompleted: false,
            user_id: session?.user?.id
        };

        const { data, error } = await supabase
            .from('Todos')
            .insert([newTodoData])
            .select()
            .single();

        if (error) {
            console.error('Error adding todo:', error);
        } else {
            setTodoList((prev) => [...prev, data]);
            setNewTodo('');
            setDescription('');
            setImageFile(null);
        }
    };

    const completeTask = async (id, isCompleted) => {
        const { error } = await supabase
            .from('Todos')
            .update({ isCompleted: !isCompleted })
            .eq('id', id)
            .eq('user_id', session?.user.id); // Filter by user_id;

        if (!error) {
            setTodoList((prev) =>
                prev.map((todo) =>
                    todo.id === id ? { ...todo, isCompleted: !isCompleted } : todo
                )
            );
        }
    };

    const deleteTask = async (id) => {
        const { error } = await supabase
            .from('Todos')
            .delete()
            .eq('id', id);

        if (!error) {
            setTodoList((prev) => prev.filter((todo) => todo.id !== id));
        }
    };

    return (
        <div className="w-full p-6 bg-black text-white rounded-2xl shadow-lg">
            <div className="flex items-center justify-center mb-4">
                <img src="/supabase-logo-icon.png" alt="Supabase Logo" className="h-12 w-12 mr-2" />
                <h1 className="text-2xl font-bold text-center text-green-400">
                    Supabase Todo
                </h1>
            </div>

            <div className="flex flex-col gap-2 mb-4">
                <input
                    type="text"
                    placeholder="Task name..."
                    className="p-2 border border-green-500 bg-black text-white rounded-lg"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                />
                <textarea
                    placeholder="Description..."
                    className="p-2 border border-green-500 bg-black text-white rounded-lg"
                    rows={4}  // You can adjust the rows value for the height of the textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <input
                    type="file"
                    accept="image/*"
                    className="p-2 border border-green-500 text-white rounded-lg"
                    onChange={(e) => setImageFile(e.target.files[0])}
                />
                <button
                    onClick={addTodo}
                    className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-400 flex items-center justify-center gap-1"
                >
                    <Plus size={16} />
                    Add
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {todoList.map((todo) => (
                    <div
                        key={todo.id}
                        className="flex flex-col p-4 bg-zinc-900 rounded-xl hover:shadow transition relative"
                    >
                        {todo.image_url && (
                            <img
                                src={todo.image_url}
                                alt="todo"
                                className="w-full h-40 object-cover rounded-lg mb-3"
                            />
                        )}
                        <h3
                            className={`text-lg font-semibold ${todo.isCompleted ? 'line-through text-gray-500' : ''}`}
                        >
                            <Link to={`/todo/${todo.id}`} className="text-blue-400 hover:underline">
                                {todo.name}
                            </Link>
                        </h3>
                        {todo.description && (
                            <p className="text-sm text-gray-400 mb-2">{todo.description}</p>
                        )}
                        <div className="flex gap-2 mt-auto">
                            <button
                                onClick={() => completeTask(todo.id, todo.isCompleted)}
                                className={`px-2 py-1 rounded-lg text-white ${todo.isCompleted
                                    ? 'bg-yellow-500 hover:bg-yellow-400'
                                    : 'bg-green-600 hover:bg-green-500'
                                    }`}
                            >
                                <CheckCircle size={18} />
                            </button>
                            <button
                                onClick={() => deleteTask(todo.id)}
                                className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded-lg"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TodoList;
