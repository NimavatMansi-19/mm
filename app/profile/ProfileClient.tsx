"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, User } from "lucide-react";
import { updateProfilePic } from "@/app/actions/updateProfilePic";

interface ProfileClientProps {
    initialImage: string | null;
    userName: string;
}

export default function ProfileClient({ initialImage, userName }: ProfileClientProps) {
    const [image, setImage] = useState<string | null>(initialImage);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file.");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert("Image size should be less than 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadstart = () => setIsUploading(true);
        reader.onload = async (event) => {
            const base64String = event.target?.result as string;
            try {
                await updateProfilePic(base64String);
                setImage(base64String);
                // toast.success("Profile picture updated!");
            } catch (error) {
                console.error("Upload failed:", error);
                alert("Failed to update profile picture.");
            } finally {
                setIsUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="relative group">
            <div className="mx-auto w-32 h-32 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-white mb-4 shadow-2xl shadow-indigo-500/20 overflow-hidden relative border-4 border-white">
                {image ? (
                    <img
                        src={image}
                        alt={userName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <User size={64} />
                )}
                
                {isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="animate-spin text-white" size={32} />
                    </div>
                )}

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300"
                    disabled={isUploading}
                >
                    <Camera className="text-white" size={32} />
                </button>
            </div>
            
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
            />
            
            <div className="text-center">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest mt-2"
                >
                    {image ? "Change Photo" : "Add Photo"}
                </button>
            </div>
        </div>
    );
}
