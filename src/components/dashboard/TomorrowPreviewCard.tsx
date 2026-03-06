interface TomorrowPreviewCardProps {
  text: string | null
}

export function TomorrowPreviewCard({ text }: TomorrowPreviewCardProps) {
  if (!text) {
    return <p className="text-sm text-muted-foreground py-2">내일 계획이 없어요.</p>
  }

  return (
    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{text}</p>
  )
}
