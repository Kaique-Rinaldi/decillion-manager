import { motion, AnimatePresence } from "framer-motion";

function initials(name) {
  return name
    .trim()
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function ClientList({ clients, removeClient }) {
  const count = clients.length;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-medium tracking-widest uppercase text-gray-400">
          Cadastrados
        </p>
        <span className="text-[11px] font-medium text-gray-400 bg-gray-100
          border border-gray-200 rounded-full px-2.5 py-0.5">
          {count === 0
            ? "0 clientes"
            : count === 1
            ? "1 cliente"
            : `${count} clientes`}
        </span>
      </div>

      {count === 0 && (
        <div className="flex flex-col items-center justify-center py-10 gap-2
          border border-dashed border-gray-200 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#d1d5db"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <p className="text-sm text-gray-400">Nenhum cliente ainda</p>
          <p className="text-xs text-gray-300">Adicione seu primeiro cliente acima</p>
        </div>
      )}

      <AnimatePresence initial={false}>
        {clients.map((client, index) => (
          <motion.div
            key={client.email + index}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg
            border border-gray-100 mb-2 last:mb-0 group
            hover:border-gray-200 hover:bg-gray-50 transition-all"
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center
              text-[11px] font-medium flex-shrink-0"
              style={{
                backgroundColor: client.color?.bg ?? "#E6F1FB",
                color: client.color?.color ?? "#0C447C",
              }}
            >
              {initials(client.name)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 leading-tight">
                {client.name}
              </p>
              <p className="text-xs text-gray-400 truncate">{client.email}</p>
            </div>

            {/* Remove */}
            <button
              onClick={() => removeClient(index)}
              aria-label={`Remover ${client.name}`}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-md
              text-gray-300 hover:text-red-400 hover:bg-red-50
              transition-all flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default ClientList;