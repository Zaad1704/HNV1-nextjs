'use client';
import React, { useState, useEffect } from "react";
import apiClient from "@/lib/api";

const ContentManagementPage: React.FC = () => {
  const [content, setContent] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    setLoading(true);
    const res = await apiClient.get("/admin/content");
    setContent(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContent({ ...content, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    await apiClient.put("/admin/content", content);
    alert("Content updated");
  };

  if (loading) return <div className="p-8">Loading...</div>;
  return (
    <div className="p-8">
      <h2 className="text-2xl mb-4">Site Content Management</h2>
      <input
        name="homeTitle"
        value={content.homeTitle || ""}
        onChange={handleChange}
        placeholder="Home Page Title"
        className="w-full p-2 mb-2 border rounded"
      />
      <textarea
        name="homeDescription"
        value={content.homeDescription || ""}
        onChange={handleChange}
        placeholder="Home Page Description"
        className="w-full p-2 mb-2 border rounded"
      />
      <button className="p-2 bg-blue-600 text-white rounded" onClick={handleSave}>
        Save Content
      </button>
    </div>
  );
};

export default ContentManagementPage;
