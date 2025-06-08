import { useEffect, useState } from "react"
import { getUsers } from "@/services/user"
import type { User } from "@/types/users"

export function Default() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    getUsers().then(setUsers).catch(console.error)
  }, [])

  return (
    <div>
      <h2 className="text-xl font-bold">Users</h2>
      <ul className="mt-4 space-y-2">
        {users.map((user, idx) => (
          <li key={idx} className="border p-2 rounded">
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  )
}
