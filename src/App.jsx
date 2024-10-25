import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [ingredients, setIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mainIngredientOptions, setMainIngredientOptions] = useState([]);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?i=list');
        if (!response.ok) {
          throw new Error(`Fetching ingredients error: ${response.status}`);
        }
        const data = await response.json();
        setIngredients(data.meals);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIngredients();
  }, []); // Load ingredients only once

  const onSetMainIngredientOptions = (e) => {
    const value = e.target.value.toLowerCase();
    e.preventDefault();

    const options = value.length
      ? ingredients.filter((item) => item.strIngredient.toLowerCase().startsWith(value))
      : [];

    if (value.length && !options.length) setMainIngredientOptions([{ strIngredient: 'Nothing found' }]);
    else setMainIngredientOptions(options);
  };

  return (
    <>
      <div>
        <h1>Recip-e-asy</h1>
        {isLoading
          ? <div><img src="/favicon.ico" />Loading</div>
          : <div>
            What is your main ingredient?
            <input type="text" onChange={onSetMainIngredientOptions} />
            <div>{
              mainIngredientOptions.map(opt => {
                return <div key={opt.strIngredient}>
                  {opt.strIngredient}
                </div>;
              })
            }</div>
          </div>
        }
      </div>
    </>
  );
}

export default App;
