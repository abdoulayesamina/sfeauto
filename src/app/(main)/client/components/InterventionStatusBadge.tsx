import { getStatusMeta, computeUIStatus, UI_TO_INTERVENTIONSTATUS } from "@/src/utils/constants/intervention-status"
import { cn } from "@/src/lib/utils"

interface InterventionStatusBadgeProps {
  status: string
  accordNumber?: string | null
  showIcon?: boolean
  className?: string
}

export default function InterventionStatusBadge({ 
  status,
  accordNumber,
  showIcon = true,
  className 
}: InterventionStatusBadgeProps) {
  // Convert UI status to DB status if needed
  const dbStatus = UI_TO_INTERVENTIONSTATUS[status] || (status as any);
  const uiStatus = computeUIStatus({ int_status: dbStatus })
  const statusMeta = getStatusMeta(uiStatus)
  const StatusIcon = statusMeta.icon

  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-full border w-fit",
      statusMeta.bg,
      statusMeta.color,
      "border-opacity-50",
      className
    )}>
      <div className={`w-2 h-2 rounded-full ${statusMeta.color.replace('text-', 'bg-')}`} />
      <span className="font-medium">{statusMeta.label}</span>
      {showIcon && <StatusIcon size={16} />}
    </div>
  )
}