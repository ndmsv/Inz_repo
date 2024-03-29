import React, { useState, useEffect } from 'react';
import { fetchData } from './services/apiService';
import { loginUser } from './services/apiService';

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    const login = event.target.loginInput.value;
    const password = event.target.passwordInput.value;

    try {
      const response = await loginUser(login, password);

      if (response.isSuccess) {
        setMessageColor("green");
      } else {
        setMessageColor("red");
      }
      setMessage(response.message);
    } catch (error) {
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

  return (
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
              {message && <span style={{ color: messageColor, marginLeft: "10px" }}>{message}</span>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
