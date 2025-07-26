export default function Home() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-bold text-black">HNV Property Management</h1>
      <p className="text-lg text-gray-600 mt-4">Welcome to the property management system!</p>
      <div className="mt-8">
        <a href="/login" className="bg-blue-500 text-white px-6 py-3 rounded-lg mr-4">Login</a>
        <a href="/register" className="bg-green-500 text-white px-6 py-3 rounded-lg">Register</a>
      </div>
    </div>
  );
}