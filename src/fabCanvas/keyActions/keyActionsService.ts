const initDelKeyAction = (delKeyHandler: () => void) => {
  document.addEventListener("keydown", function (event) {
    if (event.code !== "Delete") return
    delKeyHandler()
  })
}

export { initDelKeyAction }
