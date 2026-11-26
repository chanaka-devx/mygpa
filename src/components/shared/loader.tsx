const Box = ({ className }: { className: string }) => (
  <div className={`box ${className}`}>
    <div className="side-left" />
    <div className="side-right" />
    <div className="side-top" />
  </div>
)

export function Loader() {
  return (
    <div className="fixed bottom-0 left-0 right-0 top-0 z-[60] flex h-full min-h-screen w-full items-center justify-center bg-gray-100/50">
      <div className="loader">
        <Box className="box-1" />
        <Box className="box-2" />
        <Box className="box-3" />
        <Box className="box-4" />
      </div>
    </div>
  )
}
