const input = document.getElementById('ingredients');
const button = document.querySelector('.generate-btn');
const recipeDiv = document.getElementById('recipe');
const spinner = document.getElementById('loading-spinner');
const allowExtras = document.getElementById('allowExtras');

button.addEventListener('click', async () => {
  const ingredients = input.value.trim();
  if (!ingredients) {
    alert('Please enter some ingredients!');
    return;
  }

  recipeDiv.innerHTML = '';
  spinner.style.display = 'block';

  // Check if the user wants to include extra ingredients
  const includeExtras = allowExtras.checked;
  const basePrompt = `Here are the ingredients I have: ${ingredients}. What can I make?`;
  const extraNote = includeExtras
    ? 'You may include one or two additional ingredients if they will improve the recipe. Respond ONLY in JSON format.'
    : 'Only use the ingredients provided. Respond ONLY in JSON format.';
  const prompt = `${basePrompt} ${extraNote}`;

  try { 
    // Make the API call to OpenAI
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
            content:
              'You are a helpful chef. Given a list of potential ingredients, return a simple recipe in JSON format with a "title", an "ingredients" array, and an "instructions" array. Please do not number the instructions. You do not need to use all the ingredients. If you can make a recipe with fewer ingredients, that is fine. The recipe should be simple and easy to follow. The instructions should be clear and concise. Do not include any additional information or commentary. Just provide the JSON response.'
          },
          {
            role: 'user',
            content: `${prompt}`
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const jsonText = data.choices[0].message.content;

    // Attempt to parse the JSON response from the AI
    const recipeJson = JSON.parse(jsonText);
    const { title, ingredients: recipeIngredients, instructions } = recipeJson;

    spinner.style.display = 'none';

    // Display the recipe
    recipeDiv.innerHTML = `
      <h2>${title}</h2>
      <h3>Ingredients:</h3>
      <ul>
        ${recipeIngredients.map(item => `<li>${item}</li>`).join('')}
      </ul>
      <h3>Instructions:</h3>
      <ol>
        ${instructions.map(step => `<li>${step}</li>`).join('')}
      </ol>
    `;
  } catch (error) {
    console.error('Error generating recipe:', error);
    spinner.style.display = 'none';
    recipeDiv.innerHTML = '<p>Something went wrong. Please try again later.</p>';
  }
});