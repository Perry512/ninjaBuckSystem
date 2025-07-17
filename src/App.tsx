import { useState, useEffect } from 'react';
import './App.css'
type Ninja = {
  ninjaName: string;
  ninjaBucks: number;
}

const BIN_ID = import.meta.env.VITE_JSONBIN_BIN_ID;
const MASTER_KEY = import.meta.env.VITE_JSONBIN_MASTER_KEY;

const apiLink = `https://api.jsonbin.io/v3/b/${BIN_ID}`

function App() {

  const [ninjaList, setNinjaList] = useState<Ninja[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNinjaName, setNewNinjaName] = useState('');
  const [newNinjaBucks, setNewNinjaBucks] = useState(0);
  const [ninjaBuckAmountInput, setNinjaBuckAmountInput] = useState<number[]>([]);

  const updateJSON = async (updatedNinjas: Ninja[]) => {
    try {
      const res = await fetch(`${apiLink}`, {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json',
          'X-Master-Key': MASTER_KEY,
        },
        body: JSON.stringify({ ninjas: updatedNinjas }),
      });

      if (!res.ok) throw new Error(`Error: ${res.statusText}`);
      console.log('Saved to JSONBin successfully');

    } catch (err) {
      console.error(err);

    }
  }

  const readJSON = async () => {

    try {
      const res = await fetch(`${apiLink}/latest`, {
        headers: {
          'X-Master-Key': MASTER_KEY,
        }
      });

      if (!res.ok) throw new Error(`Error: ${res.statusText}`);

      const data = await res.json();
      setNinjaList(data.record.ninjas);
      setLoading(false);

    } catch (err) {

      console.error('Failed to fetch: ', err);
      setLoading(false);

    }
  }

  const addNinjaBucks = (index: number, amt: number) => {
    const updatedList = [...ninjaList];
    updatedList[index].ninjaBucks += amt;
    setNinjaList(updatedList);
    updateJSON(updatedList);

  };

  const handleNinjaBuckAmountChange = (index: number, value: number) => {
    const updated = [...ninjaBuckAmountInput];
    updated[index] = value;
    setNinjaBuckAmountInput(updated);
  }

  const handleAddNinjaBuckAmountSubmit = (index: number) => {
    const amt = ninjaBuckAmountInput[index];
    if (!amt || amt <= 0) return alert("Please enter amount greater than 0!");
    addNinjaBucks(index, amt);

    const updated = [...ninjaBuckAmountInput];
    updated[index] = 1;
    setNinjaBuckAmountInput(updated);

  };

    const handleSubtractNinjaBuckAmountSubmit = (index: number) => {
    const amt = ninjaBuckAmountInput[index];
    if (!amt) return alert("Please enter amount greater than 0!");
    addNinjaBucks(index, -amt);

    const updated = [...ninjaBuckAmountInput];
    updated[index] = 1;
    setNinjaBuckAmountInput(updated);
    
  };


  const handleAddNinja = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newNinjaName.trim()) return alert('Please enter a name');

    // Check for adding a negative amount of Ninja bucks
    if (newNinjaBucks < 0) return alert('Please enter value over 0');

    const newNinja: Ninja = {
      ninjaName: newNinjaName.trim().toUpperCase(),
      ninjaBucks: newNinjaBucks,
    };

    const updatedList = [...ninjaList, newNinja];
    setNinjaList(updatedList);
    updateJSON(updatedList);

    setNewNinjaName('');
    setNewNinjaBucks(0);

  }
                                                          
  const ninjaRender = ninjaList.map((ninja, index) => {
    return(
    <tr key={index}>
      <td>{ninja.ninjaName}</td>
      <td>{ninja.ninjaBucks}</td>
      <td>
        <input 
          type="number"
          value={ninjaBuckAmountInput[index]}
          onChange={(e) => handleNinjaBuckAmountChange(index, parseInt(e.target.value))}
        />
        <button onClick={() => handleAddNinjaBuckAmountSubmit(index)}> Add Ninja Bucks </button>
        <button onClick={() => handleSubtractNinjaBuckAmountSubmit(index)}> Spend Ninja Bucks </button>
      </td>
    </tr>
    )
  });

  useEffect(() => {
    readJSON();
  }, []);

  useEffect(() => {
    if (ninjaList.length > 0) {
      setNinjaBuckAmountInput(new Array(ninjaList.length).fill(1));
    }
  }, [ninjaList]);
  
  return (
    <>
    {loading ? (
      <p> Loading... </p>
    ) : (
      <>
      <form onSubmit={handleAddNinja} style={{marginBottom: '1rem'}}>
        <input
          type="text"
          placeholder="Ninjas Name"
          value={newNinjaName}
          onChange={(e) => setNewNinjaName(e.target.value)}
          required
        />
        <input
          type="number"
          value={newNinjaBucks}
          onChange={(e) => setNewNinjaBucks(parseInt(e.target.value))}
          required
        />
        <button type="submit"> Add Ninja </button>
      </form>  

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>$$$</th>
            <th>Add</th>
            <th>Spend</th>
          </tr>
        </thead>
        <tbody>{ninjaRender}</tbody>
      </table>
      </>
    )}
    </>
  )
}

export default App
