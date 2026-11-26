import { HELP_CONTENT_HTML } from './help-content'

export function HelpPage() {
  return (
    <div
      className="w-full p-4"
      dangerouslySetInnerHTML={{ __html: HELP_CONTENT_HTML }}
    />
  )
}
