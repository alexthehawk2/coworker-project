const toastTrigger = document.getElementById('message')
const toastLiveExample = document.getElementById('liveToast')
if (toastTrigger) {
  toastTrigger.addEventListener('load', () => {
    const toast = new bootstrap.Toast(toastLiveExample)

    toast.show()
  })
}
