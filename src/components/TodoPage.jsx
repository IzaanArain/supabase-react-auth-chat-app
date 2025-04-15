import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';  // to get the dynamic route parameter
import { supabase } from '../lib/supabase';
import { useAuthContext } from "../context/AuthContext.jsx";
import { v4 as uuid } from 'uuid';

const TodoPage = () => {
    const { id } = useParams();  // Get the todo id from the URL
    const { session } = useAuthContext();  // Access user session
    const [todo, setTodo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);  // State to toggle between view and edit mode
    const [title, setTitle] = useState('');  // To store the edited title
    const [description, setDescription] = useState('');  // To store the edited description
    const [newImage, setNewImage] = useState(null);  // To store the new image selected by the user
    const [imageUrl, setImageUrl] = useState(todo?.image_url || '');  // To store the image URL

    // Fetch the todo data from Supabase
    const fetchTodo = async () => {
        if (!session?.user) {
            console.error('User session is unavailable');
            return;
        }

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
            setTitle(data.name);  // Pre-populate title
            setDescription(data.description);  // Pre-populate description
            setImageUrl(data.image_url);  // Set the existing image URL
        }
        setLoading(false);
    };

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

    
    // Update the todo data
    const updateTodo = async () => {
        if (!session?.user) {
            console.error('User session is unavailable');
            return;
        }

        let imageUrlToUpdate = imageUrl;

         // If there's a new image, upload it to Supabase storage
    if (newImage) {
        imageUrlToUpdate = await uploadImage(newImage, id); // Upload and get the URL
        if (!imageUrlToUpdate) {
            console.error('Image upload failed');
            return;
        }
    }

        const { data, error } = await supabase
            .from('Todos')
            .update({ name: title, description: description, image_url: imageUrlToUpdate })
            .eq('id', id)
            .eq('user_id', session?.user.id);
        
        if (error) {
            console.error('Error updating todo:', error);
        } else {
            fetchTodo();  // Update the todo in the state after the change
            setIsEditing(false);  // Exit edit mode
            setImageUrl(imageUrlToUpdate);  // Update the image URL in the state
        }
    };

    useEffect(() => {
        if (session?.user) {
            fetchTodo();
        }
    }, [id, session]);  // Dependency on session and id to fetch data after session is available

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!todo) {
        return <div>Todo not found</div>;
    }

    return (
        <div className="w-full p-6 text-white rounded-2xl shadow-lg">
            <h1 className="text-2xl font-bold mb-4 text-center text-green-400">Todo: {isEditing ? 'Edit Todo' : todo.name}</h1>

            {/* Editable section */}
            {isEditing ? (
                <div className="mb-4">
                    <label className="block text-sm mb-1">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2 mb-4 text-black rounded-lg"
                    />
                    <label className="block text-sm mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-2 mb-4 text-black rounded-lg"
                    />
                    <label className="block text-sm mb-1">Image</label>
                    <input
                        type="file"
                        onChange={(e) => setNewImage(e.target.files[0])}
                        className="w-full p-2 mb-4 text-black rounded-lg"
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={updateTodo}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Display the image */}
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt="todo"
                            className="w-full h-40 object-cover rounded-lg mb-3"
                        />
                    )}

                    {/* Display the description */}
                    <p className="text-sm text-gray-400 mb-2">{todo.description}</p>

                    {/* Display the completion status */}
                    <p className={`text-lg ${todo.isCompleted ? 'line-through text-gray-500' : ''}`}>
                        {todo.isCompleted ? 'Completed' : 'Not Completed'}
                    </p>

                    {/* Edit Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-yellow-500 text-white px-4 py-2 rounded-lg mt-4"
                        >
                            Edit Todo
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default TodoPage;
