import { useEffect } from "react"
import { fetchClients } from "../services/clientsService"
import { fetchDeals } from "../services/dealsService"
import { fetchTasks } from "../services/tasksService"

export function useDataLoader(user, setClients, setDeals, setTasks) {
  useEffect(() => {
    if (!user) return

    async function load() {
      const [c, d, t] = await Promise.all([
        fetchClients(),
        fetchDeals(user.id),
        fetchTasks(user.id)
      ])

      setClients(c)
      setDeals(d)
      setTasks(t)
    }

    load()
  }, [user])
}