import React, { useEffect, useState } from 'react';
import './App.css';
import { BACKEND_URL } from './config/global';

// Интерфейс для пользователей
interface User {
  position_parent_name: string;
  fullname: string;
}

// Функция для извлечения уникальных значений position_parent_name
const getUniquePositionParentNames = (employees: User[]): string[] => {
  const positionParentNames = employees
    .map(employee => employee.position_parent_name)
    .filter(name => name.trim() !== ''); // Удаляет все пустые значения

  return Array.from(new Set(positionParentNames));
};

const App: React.FC = () => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<string[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const formData = new FormData();
    formData.append('method', 'getData');

    fetch(BACKEND_URL, {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Server error');
        }
        return response.json();
      })
      .then(data => setUsers(data))
      .catch(error => setError(error.message));
  }, []);

  useEffect(() => {
    const uniquePositionParentNames = getUniquePositionParentNames(users);
    setPositions(uniquePositionParentNames);
    setFilteredPositions(uniquePositionParentNames);
  }, [users]);

  const handleCardClick = (position: string) => {
    setSelectedPosition(position);
  };

  const closePopup = () => {
    setSelectedPosition(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    const filtered = positions.filter(position =>
      position.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredPositions(filtered);
  };


  return (
    <>
      {error ? (
        <div className="error-popup">
          <div className="error-popup-content">
            <p>{error}</p>
          </div>
        </div>
      ) : (
        <>
          <header className="search">
            <div className="search-content wrapper">
              <input
                className="search-input"
                onChange={handleSearchChange}
                value={search}
                type="text"
                placeholder="Поиск..."
              />
            </div>
          </header>

          <main>
            <section className="cards">
              <div className="cards-content wrapper">
                {filteredPositions.map((position, index) => (
                  <article key={index} className="cards-card" onClick={() => handleCardClick(position)}>
                    <h3 className="cards-card-name">{position}</h3>
                  </article>
                ))}
              </div>
            </section>

            {selectedPosition && (
              <div className="popup">
                <div className="popup-content">
                  <span className="popup-close" onClick={closePopup}>&times;</span>
                  <h2 className="popup-text">{selectedPosition}</h2>
                  <ul>
                    {users.filter(user => user.position_parent_name === selectedPosition).map((user, index) => (
                      <li key={index}>{user.fullname}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </main>
        </>
      )}
    </>
  );
};

export default App;
