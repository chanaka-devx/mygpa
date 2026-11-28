import { HELP_CONTENT_HTML } from './help-content'

export function HelpPage() {
  return (
    <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
      <div
        className="help-content m3-card p-6 sm:p-8"
        dangerouslySetInnerHTML={{ __html: HELP_CONTENT_HTML }}
      />
    </div>
  )
}
