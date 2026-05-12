import { useEffect } from 'react'

import { fetchClients } from '../services/clientsService'
import { fetchDeals }   from '../services/dealsService'
import { fetchTasks }   from '../services/tasksService'

export function useDataLoader(user, addToast) {
  const { setClients, setDeals, setTasks, setDataLoading, resetAll } = useAppStore()

  useEffect(() => {
    if (!user) {
      resetAll()
      return
    }

    async function loadAll() {
      setDataLoading(true)
      try {
        const [clients, deals, tasks] = await Promise.all([
          fetchClients(user.id),
          fetchDeals(user.id),
          fetchTasks(user.id),
        ])
        setClients(clients)
        setDeals(deals)
        setTasks(tasks)
      } catch (err) {
        addToast?.(`Erro ao carregar dados: ${err.message}`, 'error')
      } finally {
        setDataLoading(false)
      }
    }

    loadAll()
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps
}