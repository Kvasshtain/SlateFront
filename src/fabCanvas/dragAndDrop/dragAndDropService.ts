function makeFromDocumentBodyDropImageZone(
  canvasClickHandler: (x: number, y: number, file: File) => void,
) {
  const dropZone = document.body

  if (!dropZone) return

  dropZone.addEventListener("dragenter", (e: DragEvent) => {
    e.preventDefault()
  })

  dropZone.addEventListener("dragover", (e: DragEvent) => {
    e.preventDefault()
  })

  dropZone.addEventListener("dragleave", (e: DragEvent) => {
    e.preventDefault()
  })

  dropZone.addEventListener("drop", (e: DragEvent) => {
    e.preventDefault()

    const dataTransfer = e.dataTransfer
    const target = e.target

    if (!dataTransfer) return

    if (!target) return

    const files = Array.from(dataTransfer.files)

    if (!FileReader || files.length <= 0) return

    const file = files[0]

    const x = e.pageX - (target as HTMLElement).offsetLeft
    const y = e.pageY - (target as HTMLElement).offsetTop

    canvasClickHandler(x, y, file)
  })
}

export { makeFromDocumentBodyDropImageZone }
