import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase';
import { CheckCircle, Trash2, Plus } from 'lucide-react';
const TodoList = () => {
    const [todoList, setTodoList] = useState([]);
    const [newTodo, setNewTodo] = useState('');

    const fetchTodos = async () => {
        const { data, error } = await supabase.from("Todos").select("*");
        if (error) {
            console.error("Error fetching todos: ", error);
        } else {
            setTodoList(data);
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    const addTodo = async () => {
        if (!newTodo.trim()) { return }
        const newTodoData = {
            name: newTodo,
            isCompleted: false
        }
        const { data, error } = await supabase
            .from("Todos")
            .insert([newTodoData])
            .select()
            .single();
        console.log("todo data", data);
        if (error) {
            console.error("Error adding todo: ", error);
        } else {
            setTodoList((prev) => [...prev, data]);
            setNewTodo("");
        }
    };

    const completeTask = async (id, isCompleted) => {
        const { data, error } = await supabase
            .from("Todos")
            .update({ isCompleted: !isCompleted })
            .eq("id", id);

        if (error) {
            console.error("Error toggling task: ", error);
        } else {
            const updatedTodoList = todoList.map((todo) => todo.id === id ? { ...todo, isCompleted: !isCompleted } : todo);
            setTodoList(updatedTodoList);
        }
    };

    const deleteTask = async (id) => {
        const { data, error } = await supabase
            .from("Todos")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting task: ", error);
        } else {
            setTodoList((prev) => prev.filter((todo) => todo.id !== id));
        }
    };

    return (
        <div className="max-w-md w-full mx-auto p-6 bg-black text-white rounded-2xl shadow-lg">
            <h1 className="text-2xl font-bold mb-4 text-center text-green-400">🟢 Supabase Todo</h1>

            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    className="flex-1 p-2 border border-green-500 bg-black text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="Add a new task..."
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                />
                <button
                    onClick={addTodo}
                    className="bg-green-500 text-black px-3 py-2 rounded-lg hover:bg-green-400 flex items-center gap-1"
                >
                    <Plus size={16} />
                    Add
                </button>
            </div>

            <ul className="space-y-3">
                {todoList.length === 0 ? (
                    <p className="text-center text-gray-500">No tasks yet ✨</p>
                ) : (
                    todoList.map((todo) => (
                        <li
                            key={todo.id}
                            className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl hover:shadow transition"
                        >
                            <span
                                className={`flex-1 ${todo.isCompleted ? 'line-through text-gray-500' : ''
                                    }`}
                            >
                                {todo.name}
                            </span>
                            <div className="flex gap-2">
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
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default TodoList;