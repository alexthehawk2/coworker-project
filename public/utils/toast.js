const toastElement = document.getElementById('liveToast')
window.addEventListener('load',()=>{
  if(document.getElementById('message').innerText){
    const toast = new bootstrap.Toast(toastElement)
    toast.show()
  }
})