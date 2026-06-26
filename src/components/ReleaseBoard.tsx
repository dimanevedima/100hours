import { CheckSquare, Square, Music, Image, Send } from 'lucide-react'
import { useStore } from '../app/store'
import type { ReleaseBoard as ReleaseBoardType } from '../app/types'

function Column({
  title,
  icon,
  section,
  items,
  onToggle,
}: {
  title: string
  icon: React.ReactNode
  section: keyof ReleaseBoardType
  items: ReleaseBoardType[keyof ReleaseBoardType]
  onToggle: (section: keyof ReleaseBoardType, id: string) => void
}) {
  const done = items.filter(i => i.done).length
  const pct = Math.round((done / items.length) * 100)

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-accent">{icon}</span>
          <h3 className="font-semibold text-text text-sm">{title}</h3>
        </div>
        <span className="text-xs font-mono-num text-muted">{done}/{items.length}</span>
      </div>

      {/* column progress */}
      <div className="h-1.5 bg-bg rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, boxShadow: pct > 0 ? '0 0 6px rgba(20,184,166,0.4)' : 'none' }}
        />
      </div>

      <div className="space-y-1.5">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onToggle(section, item.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all cursor-pointer text-left
              ${item.done
                ? 'border-success/30 bg-success/5 text-success'
                : 'border-border bg-bg text-muted hover:border-accent hover:text-text'
              }`}
          >
            {item.done
              ? <CheckSquare className="w-4 h-4 shrink-0" />
              : <Square className="w-4 h-4 shrink-0" />
            }
            <span className={`text-sm ${item.done ? 'line-through opacity-70' : ''}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function ReleaseBoard() {
  const releaseBoard = useStore(s => s.releaseBoard)
  const toggleReleaseItem = useStore(s => s.toggleReleaseItem)

  const allItems = [
    ...releaseBoard.track,
    ...releaseBoard.artwork,
    ...releaseBoard.distribution,
  ]
  const totalDone = allItems.filter(i => i.done).length
  const totalPct = Math.round((totalDone / allItems.length) * 100)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Release Board</h2>
        <span className="text-xs font-mono-num text-accent">{totalDone}/{allItems.length} · {totalPct}%</span>
      </div>

      {/* overall progress */}
      <div className="h-2 bg-bg border border-border rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent to-success rounded-full transition-all duration-700"
          style={{ width: `${totalPct}%`, boxShadow: totalPct > 0 ? '0 0 10px rgba(20,184,166,0.3)' : 'none' }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Column
          title="Track"
          icon={<Music className="w-4 h-4" />}
          section="track"
          items={releaseBoard.track}
          onToggle={toggleReleaseItem}
        />
        <Column
          title="Artwork"
          icon={<Image className="w-4 h-4" />}
          section="artwork"
          items={releaseBoard.artwork}
          onToggle={toggleReleaseItem}
        />
        <Column
          title="Distribution"
          icon={<Send className="w-4 h-4" />}
          section="distribution"
          items={releaseBoard.distribution}
          onToggle={toggleReleaseItem}
        />
      </div>
    </div>
  )
}
