import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Home from './sides/Home';
import { checkTypePassword, fetchData, loginUser, checkLogin, registerUser } from './services/apiService';
import CreateCourse from './sides/CreateCourse';
import JoinCourse from './sides/JoinCourse';
import MyCourses from './sides/MyCourses';

function App() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showRegistrationPopup, setShowRegistrationPopup] = useState(false);
  const [accountType, setAccountType] = useState('');

  const handleAccountTypeChange = (event) => {
    setAccountType(event.target.value);
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    const login = event.target.loginInput.value;
    const password = event.target.passwordInput.value;

    try {
      const response = await loginUser(login, password);

      if (response.isSuccess) {
        localStorage.setItem('username', login);
        navigate('/home');
      } else {
        alert(response.message);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    fetchData().then(data => {
      setData(data);
    }).catch(err => {
      setError(err);
    });
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const handleRegistrationSubmit = async (event) => {
    event.preventDefault();

    const login = event.target.loginInput.value;
    const password = event.target.registerPasswordInput.value;
    const repeatedPassword = event.target.repeatPasswordInput.value;
    const typeIndex = event.target.accountTypeSelect.selectedIndex;
    const typeValue = event.target.accountTypeSelect.selectedOptions[0].value;
    const name = event.target.nameInput.value;
    const surname = event.target.surnameInput.value;

    if (!login.trim()) {
      alert("Login must not be empty!");
      return;
    }

    const response = await checkLogin(login);
    if (!response.isSuccess) {
      alert(response.message);
      return;
    }

    if (!name.trim()) {
      alert("Name must not be empty!");
      return;
    }

    if (!surname.trim()) {
      alert("Surname must not be empty!");
      return;
    }

    if (password.trim().length < 4) {
      alert("Password must contain at least 4 characters!");
      return;
    }

    if (password.trim() !== repeatedPassword.trim()) {
      alert("Password and its repetition are not the same!");
      return;
    }

    if (typeIndex === 0) {
      alert("You must choose account type!");
      return;
    }

    if (typeValue === "2") {
      const accountTypePassword = event.target.accountTypePassword.value;

      const passwordResponse = await checkTypePassword(parseInt(typeValue), accountTypePassword);
      if (!passwordResponse.isSuccess) {
        alert(passwordResponse.message);
        return;
      }
    }

    const registerResponse = await registerUser(login.trim(), password.trim(), parseInt(typeValue), name.trim(), surname.trim());
    alert(registerResponse.message);
    if (registerResponse.isSuccess)
      setShowRegistrationPopup(false);
  };

  return (
      <Routes>
        <Route path="/" element={
          <div className="panel panel-default">
            <div className="panel-heading">
              <div className="text-end">
                <button type="button" className="btn btn-info" onClick={togglePopup}>Show Data</button>
              </div>
              {showPopup && (
                <div className="position-fixed start-50 translate-middle" style={{ zIndex: 1050 }}>
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <div className='col-md-6'>
                          <h5 className="modal-title">Data:</h5>
                        </div>
                        <div className='col-md-6 text-end'>
                          <button type="button" className="btn-close" aria-label="Close" onClick={togglePopup}></button>
                        </div>
                      </div>
                      <div className="modal-body">
                        {data ? <p>{data.message}</p> : <div>Loading...</div>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="panel-body">
              <div className="col-md-12">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
                  <form onSubmit={handleLogin} className="w-50">
                    <div className="mb-3">
                      <label htmlFor="loginInput" className="form-label">Login</label>
                      <input type="text" className="form-control" id="loginInput" placeholder="Enter your login" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="passwordInput" className="form-label">Password</label>
                      <input type="password" className="form-control" id="passwordInput" placeholder="Password" />
                    </div>
                    <button type="submit" className="btn btn-primary">Log In</button>
                    <br />
                    <p className="register-label" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => setShowRegistrationPopup(true)}>Register new account</p>
                  </form>

                  {showRegistrationPopup && (
                    <>
                    <div className="modal-backdrop show" style={{ zIndex: 1049 }} onClick={() => setShowRegistrationPopup(false)}></div>
                    <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
                      <div className="modal-dialog" style={{ "max-width": "50%" }}>
                        <div className="modal-content">
                          <div className="modal-header">
                            <div className='col-md-6'>
                              <h5 className="modal-title">Creation of a new account</h5>
                            </div>
                            <div className='col-md-6 text-end'>
                              <button type="button" className="btn-close" data-dismiss="modal" aria-label="Close" onClick={() => setShowRegistrationPopup(false)}></button>
                            </div>
                          </div>
                          <form onSubmit={handleRegistrationSubmit}>
                            <div className="modal-body">
                              <div className="mb-3">
                                <label htmlFor="loginInput" className="form-label">Login</label>
                                <input type="text" className="form-control" id="loginInput" placeholder="Enter your login" />
                              </div>
                              <div className="mb-3">
                                <label htmlFor="nameInput" className="form-label">Name</label>
                                <input type="text" className="form-control" id="nameInput" placeholder="Enter your name" />
                              </div>
                              <div className="mb-3">
                                <label htmlFor="surnameInput" className="form-label">Surname</label>
                                <input type="text" className="form-control" id="surnameInput" placeholder="Enter your surname" />
                              </div>
                              <div className="mb-3">
                                <label htmlFor="registerPasswordInput" className="form-label">Password</label>
                                <input type="password" className="form-control" id="registerPasswordInput" placeholder="Password" />
                              </div>
                              <div className="mb-3">
                                <label htmlFor="repeatPasswordInput" className="form-label">Repeat password</label>
                                <input type="password" className="form-control" id="repeatPasswordInput" placeholder="Repeat password" />
                              </div>
                              <div className="mb-3">
                                <label htmlFor="accountTypeSelect" className="form-label">Account type</label>
                                <select className="form-select" id="accountTypeSelect" onChange={handleAccountTypeChange} value={accountType}>
                                  <option defaultValue>Choose...</option>
                                  <option value="1">Student</option>
                                  <option value="2">Teacher</option>
                                </select>
                              </div>
                              {accountType === "2" && (
                                <div className="mb-3">
                                  <label htmlFor="accountTypePassword" className="form-label">Account Type Password</label>
                                  <input type="text" className="form-control" id="accountTypePassword" placeholder="Account type password" />
                                </div>
                              )}
                            </div>
                            <div className="modal-footer">
                              <button type="submit" className="btn btn-primary" style={{ marginRight: "5px" }}>Save</button>
                              <button type="button" className="btn btn-secondary" onClick={() => setShowRegistrationPopup(false)}>Back</button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                    </>
                  )}

                </div>
              </div>
            </div>
          </div>
        } />
        <Route path="/home" element={<Home />} />
        <Route path="/createCourse" element={<CreateCourse />} />
        <Route path="/joinCourse" element={<JoinCourse />} />
        <Route path="/myCourses" element={<MyCourses />} />
      </Routes>
  );
}

export default App;
