// https://developer.mozilla.org/en-US/docs/Web/API/Window/DOMContentLoaded_event
document.addEventListener("DOMContentLoaded", () => {
  console.log("scribbles JS imported successfully!");
});

document.addEventListener('click', function(event) {
  // Check if the clicked element or its parent is a heart button
  const button = event.target.closest('.like-button');
  if (button) {
    event.preventDefault(); // Prevent default button behavior

    const scribbleId = button.getAttribute('data-id');

    fetch(`/scribbles/${scribbleId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        button.classList.toggle('liked', data.userHasLiked);
      } else {
        alert('Error liking scribble');
      }
    })
    .catch(error => {
      console.error('Fetch error:', error);
      alert('An error occurred. Please try again.');
    });
  }
});