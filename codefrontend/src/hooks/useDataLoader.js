import { useEffect } from "react"
import { fetchClients } from "../services/clientsService"
import { fetchDeals } from "../services/dealsService"
import { fetchTasks } from "../services/tasksService"

export function useDataLoader(user, setClients, setDeals, setTasks) {
  useEffect(() => {
    if (!user?.id) return

    async function load() {
      try {
        const [clients, deals, tasks] = await Promise.all([
          fetchClients(user.id),
          fetchDeals(user.id),
          fetchTasks(user.id)
        ])

        setClients(clients)
        setDeals(deals)
        setTasks(tasks)
      } catch (err) {
        console.error("Erro ao carregar dados:", err)
      }
    }

    load()
  }, [user?.id])
}