import React, { useEffect, useState } from 'react';
import './App.css';
import { BACKEND_URL } from './config/global';

interface User {
  id: string;
  position_parent_name: string;
  fullname: string;
  current_state?: string;
}

interface HistoryState {
  state_id: string | null;
  start_date: string | null;
  finish_date: string | null;
}

interface ChangeLogs {
  date: string | null;
  position_name: string | null;
  position_parent_name: string | null;
  org_name: string | null;
}

const getUniquePositionParentNames = (employees: User[]): string[] => {
  const positionParentNames = employees
    .map(employee => employee.position_parent_name)
    .filter(name => name.trim() !== '');
  return Array.from(new Set(positionParentNames));
};

const App: React.FC = () => {
  const [searchEmployees, setSearchEmployees] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [historyStates, setHistoryStates] = useState<HistoryState[]>([]);
  const [changeLogs, setChangeLogs] = useState<ChangeLogs[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'departments' | 'employees'>('departments');

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
  }, [users]);

  const handleCardClick = (position: string) => {
    setSelectedPosition(position);
  };

  const closePopup = () => {
    setSelectedPosition(null);
    setSelectedUser(null);
    setHistoryStates([]);
  };

  const handleSearchEmployeesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchEmployees(value);
  };

  const formatDateString = (dateString: string | null) => {
    if (!dateString) return 'Invalid date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };  

  const fetchUserInfo = (user_id: string) => {
    if (user_id) {
      const formData = new FormData();
      formData.append('method', 'getUserInfo');
      formData.append('user_id', user_id);
  
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
        .then(xmlText => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText.data, 'application/xml');
          console.log(xmlDoc);
  
          if (xmlDoc.getElementsByTagName('history_states').length !== 0) {
            const historyStatesElement = xmlDoc.getElementsByTagName('history_states')[0];
  
            const historyStates = Array.from(historyStatesElement.getElementsByTagName('history_state')).map(state => ({
              state_id: state.getElementsByTagName('state_id')[0].textContent,
              start_date: formatDateString(state.getElementsByTagName('start_date')[0].textContent),
              finish_date: formatDateString(state.getElementsByTagName('finish_date')[0].textContent),
            }));
  
            setHistoryStates(historyStates);
          }
  
          if (xmlDoc.getElementsByTagName('change_logs').length !== 0) {
            const changeLogsElement = xmlDoc.getElementsByTagName('change_logs')[0];
  
            const changeLogs = Array.from(changeLogsElement.getElementsByTagName('change_log')).map(log => ({
              date: formatDateString(log.getElementsByTagName('date')[0].textContent),
              position_name: log.getElementsByTagName('position_name')[0].textContent,
              position_parent_name: log.getElementsByTagName('position_parent_name')[0].textContent,
              org_name: log.getElementsByTagName('org_name')[0].textContent,
            }));
  
            setChangeLogs(changeLogs);
          }
        })
        .catch(error => {
          console.error('Fetch error:', error.message);
          setError(error.message);
        });
    }
  };
  

  const handleUserClick = (user: User) => {
    fetchUserInfo(user.id);
    setSelectedUser(user);
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
          <header className="tabs">
            <button 
              className={`tab ${activeTab === 'departments' ? 'active' : ''}`} 
              onClick={() => setActiveTab('departments')}
            >
              Подразделения
            </button>
            <button 
              className={`tab ${activeTab === 'employees' ? 'active' : ''}`} 
              onClick={() => setActiveTab('employees')}
            >
              Сотрудники
            </button>
          </header>

          {activeTab === 'departments' && (
            <main>
              <section className="cards">
                <div className="cards-content wrapper">
                  {positions.map((position, index) => (
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
          )}

          {activeTab === 'employees' && (
            <main>
              <header className="search">
                <div className="search-content wrapper">
                  <input
                    className="search-input"
                    onChange={handleSearchEmployeesChange}
                    value={searchEmployees}
                    type="text"
                    placeholder="Поиск сотрудников..."
                  />
                </div>
              </header>

              <section className="cards">
                <div className="cards-content wrapper">
                  {users
                    .filter(user => user.fullname.toLowerCase().includes(searchEmployees.toLowerCase()))
                    .map((user, index) => (
                      <article key={index} className="cards-card" onClick={() => handleUserClick(user)}>
                        <h3 className="cards-card-name">{user.fullname}</h3>
                      </article>
                    ))}
                </div>
              </section>

              {selectedUser && (
                <div className="popup">
                  <div className="popup-content">
                    <span className="popup-close" onClick={closePopup}>&times;</span>
                    <h2 className="popup-text">{selectedUser.fullname}</h2>
                    {historyStates.length > 0 && (
                      <div>
                        <ul>
                          {historyStates.map((state, index) => (
                            <li key={index} className="state">
                              <h4 className="state-subtitle">Состояние №{index+1}</h4>
                              <small>ID: {state.state_id}</small>
                              <small>Начало: {state.start_date}</small>
                              <small>Конец: {state.finish_date}</small>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {changeLogs.length > 0 && (
                      <div>
                        <ul>
                          {changeLogs.map((log, index) => (
                            <li key={index} className="state">
                              <h4 className="state-subtitle">Изменение №{index+1}</h4>
                              <small>Дата: {log.date}</small>
                              <small>Организация: {log.org_name}</small>
                              <small>Должность: {log.position_name}</small>
                              <small>Территория: {log.position_parent_name}</small>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </main>
          )}
        </>
      )}
    </>
  );
};

export default App;
