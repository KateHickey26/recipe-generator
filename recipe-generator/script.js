// script.js
const input = document.getElementById('ingredients');
const button = document.querySelector('.generate-btn');
const recipeDiv = document.getElementById('recipe');

button.addEventListener('click', async () => {
  const ingredients = input.value.trim();
  if (!ingredients) {
    alert('Please enter some ingredients!');
    return;
  }

  recipeDiv.innerHTML = '<p>Generating recipe...</p>';

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful chef who creates simple recipes based on available ingredients.'
          },
          {
            role: 'user',
            content: `Here are the ingredients I have: ${ingredients}. What can I make?`
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const recipe = data.choices[0].message.content;
    recipeDiv.innerHTML = `<pre>${recipe}</pre>`;
  } catch (error) {
    console.error(error);
    recipeDiv.innerHTML = '<p>Something went wrong. Please try again later.</p>';
  }
});