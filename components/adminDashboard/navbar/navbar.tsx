import Link from "next/link"


const Navbar = () => {
  return (
    <div className="flex flex-col items-center shadow-md">

        <div className="min-h-[8vh] max-w-7xl w-full flex justify-between items-center border-b border-gray-300">
            <h1>Blog Admin</h1>

            <div className="flex gap-2">
                <p>Welcome, Admin user</p>
                <h6>Profile</h6>
            </div>
        </div>

        <div className="min-h-[8vh] max-w-7xl w-full flex justify-start items-center gap-6">
            <Link href="/dashboard">Analytics</Link>
            <Link href="/dashboard/users">Users</Link>
            <Link href="/dashboard/posts">Posts</Link>
            <Link href="/dashboard/category">Cateogory</Link>
            <Link href="/dashboard/comments">Comments</Link>
            <Link href="/dashboard/profile">Profile</Link>
        </div>
       
    </div>
  )
}

export default Navbar