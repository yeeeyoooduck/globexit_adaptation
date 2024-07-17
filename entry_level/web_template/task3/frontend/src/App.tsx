import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import { BACKEND_URL } from './config/global';

interface User {
  id: string;
  code: string;
  position_parent_name: string;
  position_parent_id: string;
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

interface Departments {
  id: string;
  code: string;
  name: string;
  org_id: string;
  parent_object_id: string | null;
  children: Departments[];
}

const buildHierarchy = (departments: Departments[]): Departments[] => {
  const map: { [key: string]: Departments } = {};

  departments.forEach(department => {
    map[department.id] = { ...department, children: [] };
  });

  const roots: Departments[] = [];

  departments.forEach(department => {
    if (department.parent_object_id) {
      map[department.parent_object_id].children.push(map[department.id]);
    } else {
      roots.push(map[department.id]);
    }
  });

  return roots;
};

const DepartmentNode: React.FC<{ department: Departments, onDepartmentClick: (departmentId: string) => void }> = ({ department, onDepartmentClick }) => {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    if (department && department.children && department.children.length > 0) {
      setExpanded(!expanded);
    } else {
      onDepartmentClick(department.id);
    }
  };

  return (
    <li>
      <div onClick={handleClick}>
        {department.name}
      </div>
      {expanded && department.children.length > 0 && (
        <ul>
          {department.children.map(child => (
            <DepartmentNode key={child.id} department={child} onDepartmentClick={onDepartmentClick} />
          ))}
        </ul>
      )}
    </li>
  );
};

const DepartmentFilterNode: React.FC<{ department: Departments, selectedDepartments: Set<string>, toggleDepartment: (departmentId: string) => void }> = ({ department, selectedDepartments, toggleDepartment }) => {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    if (department && department.children && department.children.length > 0) {
      setExpanded(!expanded);
    }
  };

  return (
    <li>
      <div onClick={handleClick}>
        <input
          type="checkbox"
          checked={selectedDepartments.has(department.id)}
          onChange={() => toggleDepartment(department.id)}
        />
        {department.name}
      </div>
      {expanded && department.children.length > 0 && (
        <ul>
          {department.children.map(child => (
            <DepartmentFilterNode key={child.id} department={child} selectedDepartments={selectedDepartments} toggleDepartment={toggleDepartment} />
          ))}
        </ul>
      )}
    </li>
  );
};

const DepartmentFilter: React.FC<{ departments: Departments[], selectedDepartments: Set<string>, toggleDepartment: (departmentId: string) => void }> = ({ departments, selectedDepartments, toggleDepartment }) => (
  <ul className = "departments-filters">
    {departments.map(department => (
      <DepartmentFilterNode key={department.id} department={department} selectedDepartments={selectedDepartments} toggleDepartment={toggleDepartment} />
    ))}
  </ul>
);

const App: React.FC = () => {
  const [searchEmployees, setSearchEmployees] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [historyStates, setHistoryStates] = useState<HistoryState[]>([]);
  const [changeLogs, setChangeLogs] = useState<ChangeLogs[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'departments' | 'employees' | 'team'>('departments');
  const [departments, setDepartments] = useState<Departments[]>([]);
	const [rawDepartments, setRawDepartments] = useState<Departments[]>([]);
  const [team, setTeam] = useState<User[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<Set<string>>(new Set());
	const [visibleCards, setVisibleCards] = useState<number>(20);
  const [loading, setLoading] = useState<boolean>(false);

	const bottomBoundaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true)
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
      .then(data => {
        setUsers(data)
        setLoading(false)
      })
      .catch(error => setError(error.message));
  }, []);

  useEffect(() => {
    setLoading(true)
    const formData = new FormData();
    formData.append('method', 'getDepartments');

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
      .then(data => {
        const hierarchyData = buildHierarchy(data);
				setRawDepartments(data);
        setDepartments(hierarchyData);
        setLoading(false)
      })
      .catch(error => setError(error.message));
  }, []);

  const fetchTeam = () => {
    setLoading(true)
    const formData = new FormData();
    formData.append('method', 'getTeam');

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
      .then(data => {
        setTeam(data)
        setLoading(false)
      })
      .catch(error => setError(error.message));
  }

  const fetchUserInfo = (user_id: string) => {
    if (user_id) {
      const formData = new FormData();
      formData.append('method', 'getDetails');
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
        .then(data => {
          const historyStates = data.history_states.history_state.map((state: HistoryState) => ({
            state_id: state.state_id,
            start_date: state.start_date,
            finish_date: state.finish_date
          }))

          setHistoryStates(historyStates);

          const changeLogs = data.change_logs.change_log.map((log: ChangeLogs) => ({
            date: log.date,
            position_name: log.position_name,
            position_parent_name: log.position_parent_name,
            org_name: log.org_name
          }));
          
          setChangeLogs(changeLogs);
        })
        .catch(error => {
          console.error('Fetch error:', error.message);
          setError(error.message);
        });
    }
  };

  const handleAddToTeam = (user: User) => {
    const formData = new FormData();
    formData.append('method', 'addSubscription');
    formData.append('user_id', user.id);

    fetch(BACKEND_URL, {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Server error');
        }
        return response;
      })
      .then(data => {
        console.log(data)
        fetchTeam()
      })
      .catch(error => setError(error.message));
  };

  const handleRemoveFromTeam = (user: User) => {
    const formData = new FormData();
    formData.append('method', 'removeSubscription');
    formData.append('subscription_id', user.code);

    fetch(BACKEND_URL, {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Server error');
        }
        return response;
      })
      .then(data => {
        console.log(data)
        fetchTeam()
      })
      .catch(error => setError(error.message));
  };

  const handleCardClick = (departmentId: string) => {
    setSelectedPosition(departmentId);
  };

  const handleSearchEmployeesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchEmployees(value);
  };

  const handleUserClick = (user: User) => {
    fetchUserInfo(user.id);
    setSelectedUser(user);
  };

  const closePopup = () => {
    setSelectedPosition(null);
    setSelectedUser(null);
    setHistoryStates([]);
  };

  const toggleDepartment = (departmentId: string) => {
    setSelectedDepartments(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(departmentId)) {
        newSelected.delete(departmentId);
      } else {
        newSelected.add(departmentId);
      }
      return newSelected;
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullname.toLowerCase().includes(searchEmployees.toLowerCase());
    const matchesDepartment = selectedDepartments.size === 0 || selectedDepartments.has(user.position_parent_id);
    const notInTeam = !team.some(teamMember => teamMember.id === user.id);
    return matchesSearch && matchesDepartment && notInTeam;
  });
  

	const filteredTeamUsers = team.filter(user => {
    const matchesSearch = user.fullname.toLowerCase().includes(searchEmployees.toLowerCase());
    const matchesDepartment = selectedDepartments.size === 0 || selectedDepartments.has(user.position_parent_id);
    return matchesSearch && matchesDepartment;
  });

  useEffect(() => {
    const handleScroll = () => {
      if (
        bottomBoundaryRef.current &&
        window.innerHeight + window.scrollY >= bottomBoundaryRef.current.offsetTop
      ) {
        setVisibleCards(prev => prev + 20);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'team' || activeTab === 'employees') {
      fetchTeam();
    }
  }, [activeTab]);

  const updateURL = (tab: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url.toString());
  };
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && (tab === 'departments' || tab === 'employees' || tab === 'team')) {
      setActiveTab(tab as 'departments' | 'employees' | 'team');
    }
  }, []);

  return (
    <>
      {error && (
        <div className="error">
          <p>{error}</p>
        </div>
      )}
      {!error && (
        <>
          <header className="tab-container">
            <button
              className={`tab tooltip ${activeTab === 'departments' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('departments');
                updateURL('departments');
              }}
              data-tooltip="Перейти на вкладку подразделений"
            >
              Подразделения
            </button>
            <button
              className={`tab tooltip ${activeTab === 'employees' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('employees');
                updateURL('employees');
              }}
              data-tooltip="Перейти на вкладку сотрудников"
            >
              Сотрудники
            </button>
            <button
              className={`tab tooltip ${activeTab === 'team' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('team');
                updateURL('team');
              }}
              data-tooltip="Перейти на вкладку команды"
            >
              Команда
            </button>
          </header>

          {activeTab === 'departments' && (
            <main>
              <section className="department-hierarchy">
                {departments.map(department => (
                  <DepartmentNode key={department.id} department={department} onDepartmentClick={handleCardClick} />
                ))}
              </section>
              {selectedPosition && (
                <div className="popup">
                  <div className="popup-content">
                    <span className="popup-close" onClick={closePopup}>&times;</span>
                    <h2 className="popup-text">{departments.find(dep => dep.id === selectedPosition)?.name}</h2>
                    <ul>
                      {users.filter(user => user.position_parent_id === selectedPosition).map((user, index) => (
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

              <DepartmentFilter
                departments={rawDepartments}
                selectedDepartments={selectedDepartments}
                toggleDepartment={toggleDepartment}
              />

              <section className="cards">
                <div className="cards-content wrapper">
                  {filteredUsers.slice(0, visibleCards).map((user, index) => (
                    <article key={index} className="cards-card">
                      <div className="cards-card-name" onClick={() => handleUserClick(user)}>
                        <h3>{user.fullname}</h3>
                      </div>
                      <button
                        className="cards-card-add tooltip"
                        data-tooltip="Добавить пользователя в команду"
                        onClick={() => handleAddToTeam(user)}
                      >
                        Добавить в команду
                      </button>
                    </article>
                  ))}
                  {loading && (
                    <div className="loading">
                      <p>Loading more...</p>
                    </div>
                  )}
                </div>
                <div ref={bottomBoundaryRef} />
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
                              <h4 className="state-subtitle">Состояние №{index + 1}</h4>
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
                              <h4 className="state-subtitle">Изменение №{index + 1}</h4>
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

          {activeTab === 'team' && (
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

							<DepartmentFilter
                departments={rawDepartments}
                selectedDepartments={selectedDepartments}
                toggleDepartment={toggleDepartment}
              />

              <section className="cards">
                <div className="cards-content wrapper">
                  {filteredTeamUsers
                    .filter(user => user.fullname.toLowerCase().includes(searchEmployees.toLowerCase()))
                    .map((user, index) => (
                      <article key={index} className="cards-card">
                        <div className="cards-card-name" onClick={() => handleUserClick(user)}>
                          <h3>{user.fullname}</h3>
                        </div>
                        <button className="cards-card-delete tooltip" data-tooltip="Удалить пользователя из команды" onClick={() => handleRemoveFromTeam(user)}>Удалить из команды</button>
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
                              <h4 className="state-subtitle">Состояние №{index + 1}</h4>
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
                              <h4 className="state-subtitle">Изменение №{index + 1}</h4>
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
